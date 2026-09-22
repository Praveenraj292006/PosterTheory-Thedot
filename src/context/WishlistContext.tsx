import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  favourites: number[];
  isFavourite: (productId: number) => boolean;
  toggleFavourite: (productId: number) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const GUEST_WISHLIST_KEY = "poster_favourites";

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, token } = useAuth();

  const [favourites, setFavourites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(GUEST_WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  // Save guest wishlist
  useEffect(() => {
    if (!user) {
      localStorage.setItem(
        GUEST_WISHLIST_KEY,
        JSON.stringify(favourites)
      );
    }
  }, [favourites, user]);

  // Load + merge wishlist when user logs in
  useEffect(() => {
    if (!user || !token) return;

    const syncWishlist = async () => {
      setLoading(true);

      try {
        const guestWishlist: number[] = JSON.parse(
          localStorage.getItem(GUEST_WISHLIST_KEY) || "[]"
        );

        const response = await api.get(
          "/api/profile/favourites"
        );

        const serverWishlist: number[] = response.data.map(
          (product: any) => Number(product.id)
        );

        // Merge guest + account wishlist
        const merged = [
          ...new Set([
            ...serverWishlist,
            ...guestWishlist,
          ]),
        ];

        // Sync guest items to database
        if (guestWishlist.length > 0) {
          await api.post(
            "/api/profile/favourites/sync",
            {
              productIds: guestWishlist,
            }
          );
        }

        setFavourites(merged);

        // Guest wishlist has now been transferred
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      } catch (error) {
        console.error(
          "Wishlist sync failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    syncWishlist();
  }, [user, token]);

  const isFavourite = (productId: number) => {
    return favourites.includes(Number(productId));
  };

  const toggleFavourite = async (productId: number) => {
    const id = Number(productId);

    // Guest user
    if (!user || !token) {
      setFavourites((prev) => {
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        }

        return [...prev, id];
      });

      return;
    }

    // Logged-in user
    try {
      const response = await api.post(
        "/api/profile/favourites",
        {
          productId: id,
        }
      );

      if (response.data.favourited) {
        setFavourites((prev) => [
          ...new Set([...prev, id]),
        ]);
      } else {
        setFavourites((prev) =>
          prev.filter((item) => item !== id)
        );
      }
    } catch (error) {
      console.error(
        "Toggle favourite failed:",
        error
      );
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        favourites,
        isFavourite,
        toggleFavourite,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
};