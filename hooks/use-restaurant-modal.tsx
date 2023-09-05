import { create } from "zustand";

interface useResstaurantModal {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const useRestaurantModal = create<useResstaurantModal>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false })
}))