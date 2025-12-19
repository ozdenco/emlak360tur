
export interface Property {
    propertyId: string;
    title: string;
    location: string;
    rooms: string;
    size: number;
    floor: number;
    price: number;
    features: string[];
    description: string;
    ownerPhone: string;
}

export interface Photo {
    id?: number; // IndexedDB'den gelen id
    tourId?: string;
    file: File;
    previewUrl: string; // Object URL
    includeInTour: boolean;
    tourOrder: number;
}

export interface StoredPhotoMeta {
    id: number;
    tourId: string;
    name: string;
    type: string;
    size: number;
    includeInTour: boolean;
    tourOrder: number;
}

export interface Tour {
    id: string;
    title: string;
    location: string;
    thumbnailUrl: string | null;
    photoCount: number;
    views: number;
    shares: number;
    duration: number;
    status: 'active' | 'draft';
    createdAt: string;
    property: Property;
    photosMeta: StoredPhotoMeta[];
}

export interface TourWithPhotos extends Omit<Tour, 'thumbnailUrl' | 'photoCount' | 'photosMeta'> {
    photos: Photo[];
}