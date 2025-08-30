import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, User, Mail } from "lucide-react";
import getCroppedImg from "../lib/CropImage";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [fullName, setFullName] = useState(authUser?.fullName || "");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setSelectedImg(reader.result);
      setIsCropping(true);
    };
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    try {
      const croppedImage = await getCroppedImg(selectedImg, croppedAreaPixels);
      setSelectedImg(croppedImage);
      setIsCropping(false);
      await updateProfile({ profilePic: croppedImage });
    } catch (error) {
      console.error(error);
    }
  };

  const handleNameUpdate = async () => {
    if (!fullName.trim()) return; // optional: prevent empty name
    try {
      await updateProfile({ fullName });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar upload & crop section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-45 h-45 text-center">
              {isCropping && selectedImg ? (
                <>
                  <div className="relative w-40 h-40 rounded-full overflow-hidden">
                    <Cropper
                      image={selectedImg}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <button
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
                    onClick={handleUpload}
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? "Uploading..." : "Save"}
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={selectedImg || authUser.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
                  >
                    <Camera className="w-5 h-5 text-base-200" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </>
              )}
            </div>
            {!isCropping && (
              <p className="text-sm text-zinc-400">
                {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
              </p>
            )}
          </div>

          {/* Other profile info */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </div>
              <input
                type="text"
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span> <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span> <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg"
            onClick={handleNameUpdate}
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? "Saving..." : "Save Name"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
