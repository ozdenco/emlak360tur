import { Tour, StoredPhotoMeta, Photo, TourWithPhotos } from '../types';
import { openDB, IDBPDatabase, DBSchema } from 'idb';

const DB_NAME = 'Emlak360DB';
const DB_VERSION = 1;
const TOUR_STORE = 'tours';
const PHOTO_STORE = 'photos';

interface EmlakDB extends DBSchema {
    [TOUR_STORE]: {
        key: string;
        value: Omit<Tour, 'thumbnailUrl' | 'photoCount'>;
        indexes: { 'createdAt': string };
    };
    [PHOTO_STORE]: {
        key: number;
        value: { id?: number; tourId: string; file: File };
        indexes: { 'tourId': string };
    };
}

class DatabaseService {
    private dbPromise: Promise<IDBPDatabase<EmlakDB>>;

    constructor() {
        this.dbPromise = openDB<EmlakDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(TOUR_STORE)) {
                    const tourStore = db.createObjectStore(TOUR_STORE, { keyPath: 'id' });
                    tourStore.createIndex('createdAt', 'createdAt');
                }
                if (!db.objectStoreNames.contains(PHOTO_STORE)) {
                    const photoStore = db.createObjectStore(PHOTO_STORE, { keyPath: 'id', autoIncrement: true });
                    photoStore.createIndex('tourId', 'tourId');
                }
            },
        });
    }

    async saveTour(tourData: Omit<Tour, 'id' | 'createdAt' | 'photosMeta' | 'thumbnailUrl' | 'photoCount'>, photos: Photo[], existingId?: string): Promise<void> {
        const db = await this.dbPromise;
        const tx = db.transaction([TOUR_STORE, PHOTO_STORE], 'readwrite');
        const tourStore = tx.objectStore(TOUR_STORE);
        const photoStore = tx.objectStore(PHOTO_STORE);
        
        const tourId = existingId || `tour_${Date.now()}`;

        if (existingId) {
            const oldPhotos = await photoStore.index('tourId').getAll(existingId);
            await Promise.all(oldPhotos.map(p => photoStore.delete(p.id!)));
        }

        const photosMeta: StoredPhotoMeta[] = [];
        
        const photoSavePromises = photos.map(async (photo, index) => {
            const photoId = await photoStore.add({ tourId, file: photo.file });
            photosMeta.push({
                id: photoId,
                tourId: tourId,
                name: photo.file.name,
                type: photo.file.type,
                size: photo.file.size,
                includeInTour: photo.includeInTour,
                tourOrder: photo.tourOrder
            });
        });
        
        await Promise.all(photoSavePromises);

        const tourToSave: Omit<Tour, 'thumbnailUrl' | 'photoCount'> = {
            id: tourId,
            ...tourData,
            createdAt: existingId ? (await tourStore.get(existingId))!.createdAt : new Date().toISOString(),
            photosMeta: photosMeta
        };

        await tourStore.put(tourToSave);
        await tx.done;
    }

    async getTours(): Promise<Tour[]> {
        const db = await this.dbPromise;
        const tourMetas = await db.getAllFromIndex(TOUR_STORE, 'createdAt');
        tourMetas.reverse(); // Newest first

        const toursWithThumbnails: Tour[] = await Promise.all(
            tourMetas.map(async (meta) => {
                let thumbnailUrl: string | null = null;
                const firstTourPhotoMeta = meta.photosMeta
                    .filter(p => p.includeInTour)
                    .sort((a, b) => a.tourOrder - b.tourOrder)[0];

                if (firstTourPhotoMeta) {
                    const photoRecord = await db.get(PHOTO_STORE, firstTourPhotoMeta.id);
                    if(photoRecord) {
                       thumbnailUrl = URL.createObjectURL(photoRecord.file);
                    }
                }
                return { 
                    ...meta, 
                    thumbnailUrl, 
                    photoCount: meta.photosMeta.length 
                };
            })
        );
        return toursWithThumbnails;
    }

    async getTourWithPhotos(id: string): Promise<TourWithPhotos | null> {
        const db = await this.dbPromise;
        const tourMeta = await db.get(TOUR_STORE, id);
        if (!tourMeta) return null;

        const photoRecords = await db.getAllFromIndex(PHOTO_STORE, 'tourId', id);
        
        const photos: Photo[] = photoRecords.map(record => {
             const meta = tourMeta.photosMeta.find(p => p.id === record.id);
             return {
                 id: record.id,
                 tourId: record.tourId,
                 file: record.file,
                 previewUrl: URL.createObjectURL(record.file),
                 includeInTour: meta?.includeInTour ?? false,
                 tourOrder: meta?.tourOrder ?? 0,
             }
        });

        const { photosMeta, ...restOfTour } = tourMeta;
        
        return {
            ...restOfTour,
            photos
        };
    }
    
    async deleteTour(id: string): Promise<void> {
        const db = await this.dbPromise;
        const tx = db.transaction([TOUR_STORE, PHOTO_STORE], 'readwrite');
        const tourStore = tx.objectStore(TOUR_STORE);
        const photoStore = tx.objectStore(PHOTO_STORE);
        
        const photoKeys = await photoStore.index('tourId').getAllKeys(id);
        await Promise.all(photoKeys.map(key => photoStore.delete(key)));
        
        await tourStore.delete(id);
        await tx.done;
    }

    async incrementTourViews(id: string): Promise<void> {
        const db = await this.dbPromise;
        const tour = await db.get(TOUR_STORE, id);
        if (tour) {
            tour.views = (tour.views || 0) + 1;
            await db.put(TOUR_STORE, tour);
        }
    }

    async incrementTourShares(id: string): Promise<void> {
        const db = await this.dbPromise;
        const tour = await db.get(TOUR_STORE, id);
        if (tour) {
            tour.shares = (tour.shares || 0) + 1;
            await db.put(TOUR_STORE, tour);
        }
    }
}

export const db = new DatabaseService();
