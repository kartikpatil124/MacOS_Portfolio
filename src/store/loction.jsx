import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { locations as initialLocations } from "../constants";
import { db, storage, isFirebaseConfigured } from "../firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc 
} from "firebase/firestore";
import { 
  ref, 
  uploadString, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";

const adminLocation = {
  id: 10,
  type: "admin",
  name: "Admin",
  icon: "/icons/mode.svg",
  kind: "folder",
  children: [],
};

const extendedLocations = {
  ...initialLocations,
  admin: adminLocation,
};

const useLocationStore = create(
  immer((set) => ({
    locations: extendedLocations,
    activeLocation: extendedLocations.work,
    isLoading: false,

    setActiveLocation: (location = null) => set((state) => {
      state.activeLocation = location;
    }),

    resetActiveLocation: () => set((state) => {
      state.activeLocation = state.locations.work;
    }),

    fetchProjects: async () => {
      if (!isFirebaseConfigured || !db) return;

      set((state) => {
        state.isLoading = true;
      });

      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projectsFromDb = [];
        querySnapshot.forEach((docSnap) => {
          projectsFromDb.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });

        if (projectsFromDb.length === 0) {
          console.log("Firestore empty. Seeding default projects...");
          const defaults = initialLocations.work.children;
          for (const proj of defaults) {
            await setDoc(doc(db, "projects", String(proj.id)), proj);
          }
          set((state) => {
            state.locations.work.children = defaults;
            if (state.activeLocation.id === state.locations.work.id) {
              state.activeLocation = state.locations.work;
            }
          });
        } else {
          const formattedProjects = projectsFromDb.map(proj => ({
            ...proj,
            id: isNaN(Number(proj.id)) ? proj.id : Number(proj.id),
          }));
          set((state) => {
            state.locations.work.children = formattedProjects;
            if (state.activeLocation.id === state.locations.work.id) {
              state.activeLocation = state.locations.work;
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch projects from Firestore:", error);
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    addProject: async (project, rawImageBase64 = null) => {
      let finalImageUrl = "";

      if (isFirebaseConfigured && rawImageBase64) {
        if (storage) {
          try {
            const storageRef = ref(storage, `project-previews/${project.id}`);
            await uploadString(storageRef, rawImageBase64, "data_url");
            finalImageUrl = await getDownloadURL(storageRef);
          } catch (error) {
            console.warn("Could not upload to Firebase Storage (requires upgraded plan). Falling back to saving image directly in Firestore database.", error);
            finalImageUrl = rawImageBase64;
          }
        } else {
          finalImageUrl = rawImageBase64;
        }

        const imgChild = project.children.find(c => c.fileType === "img");
        if (imgChild) {
          imgChild.imageUrl = finalImageUrl;
        }
      }

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, "projects", String(project.id)), project);
        } catch (error) {
          console.error("Failed to save project document:", error);
        }
      }

      set((state) => {
        state.locations.work.children.push(project);
        if (state.activeLocation.id === state.locations.work.id) {
          state.activeLocation = state.locations.work;
        }
      });
    },

    deleteProject: async (projectId) => {
      if (isFirebaseConfigured && db) {
        try {
          await deleteDoc(doc(db, "projects", String(projectId)));
        } catch (error) {
          console.error("Failed to delete project document:", error);
        }
      }

      if (isFirebaseConfigured && storage) {
        try {
          const storageRef = ref(storage, `project-previews/${projectId}`);
          await deleteObject(storageRef);
        } catch (error) {
          console.log("No cloud preview image found for deletion (or storage is disabled).");
        }
      }

      set((state) => {
        state.locations.work.children = state.locations.work.children.filter(
          (child) => child.id !== projectId
        );
        if (state.activeLocation.id === projectId) {
          state.activeLocation = state.locations.work;
        } else if (state.activeLocation.id === state.locations.work.id) {
          state.activeLocation = state.locations.work;
        }
      });
    },

    editProject: async (projectId, updatedFields, rawImageBase64 = null) => {
      let finalImageUrl = updatedFields.image;

      if (isFirebaseConfigured && rawImageBase64) {
        if (storage) {
          try {
            const storageRef = ref(storage, `project-previews/${projectId}`);
            await uploadString(storageRef, rawImageBase64, "data_url");
            finalImageUrl = await getDownloadURL(storageRef);
          } catch (error) {
            console.warn("Could not upload to Firebase Storage (requires upgraded plan). Falling back to saving image directly in Firestore database.", error);
            finalImageUrl = rawImageBase64;
          }
        } else {
          finalImageUrl = rawImageBase64;
        }
      }

      const oldProject = useLocationStore.getState().locations.work.children.find(
        (child) => child.id === projectId
      );

      if (!oldProject) return;

      const updatedProject = {
        ...oldProject,
        name: updatedFields.name,
        children: [
          {
            id: oldProject.children[0]?.id || Date.now() + 1,
            name: `${updatedFields.name} Project.txt`,
            icon: "/images/txt.png",
            kind: "file",
            fileType: "txt",
            position: "top-5 left-10",
            description: updatedFields.description,
          },
          {
            id: oldProject.children[1]?.id || Date.now() + 2,
            name: `${updatedFields.name.toLowerCase().replace(/\s+/g, "-")}.com`,
            icon: "/images/safari.png",
            kind: "file",
            fileType: "url",
            href: updatedFields.github,
            position: "top-10 right-20",
          },
          ...(finalImageUrl ? [{
            id: oldProject.children[2]?.id || Date.now() + 3,
            name: `${updatedFields.name.toLowerCase().replace(/\s+/g, "-")}.png`,
            icon: "/images/image.png",
            kind: "file",
            fileType: "img",
            position: "top-52 right-80",
            imageUrl: finalImageUrl,
          }] : []),
        ],
      };

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, "projects", String(projectId)), updatedProject);
        } catch (error) {
          console.error("Failed to update project document:", error);
        }
      }

      set((state) => {
        const idx = state.locations.work.children.findIndex(
          (child) => child.id === projectId
        );
        if (idx !== -1) {
          state.locations.work.children[idx] = updatedProject;
          if (state.activeLocation.id === projectId) {
            state.activeLocation = updatedProject;
          } else if (state.activeLocation.id === state.locations.work.id) {
            state.activeLocation = state.locations.work;
          }
        }
      });
    },
  }))
);

export default useLocationStore;