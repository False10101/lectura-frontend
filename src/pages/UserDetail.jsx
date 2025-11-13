import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import {
  UserCircleIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PencilIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

// Helper function to capitalize strings
const capitalize = (s) => {
  if (typeof s !== "string" || !s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Helper to format the date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

// Styled Input
const StyledInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) => (
  <div className="mb-4">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border-[1px] border-gray-300 w-full rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-[#4C1D95] focus:border-[#4C1D95] outline-none transition-colors"
    />
  </div>
);

// Clickable card for VARK options
const VarkOption = ({ Icon, title, description, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
      isActive
        ? "border-[#4C1D95] bg-[#4C1D95]/10 shadow-md"
        : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
    }`}
  >
    <div className="flex items-center">
      <Icon
        className={`w-7 h-7 mr-4 ${
          isActive ? "text-[#4C1D95]" : "text-gray-500"
        }`}
      />
      <span
        className={`font-semibold text-lg ${
          isActive ? "text-[#4C1D95]" : "text-gray-800"
        }`}
      >
        {title}
      </span>
    </div>
    <p
      className={`mt-2 text-sm ${
        isActive ? "text-gray-700" : "text-gray-500"
      }`}
    >
      {description}
    </p>
  </div>
);

// Section Card
const SettingsCard = ({ title, Icon, children, className = "" }) => (
  <div
    className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6 ${className}`}
  >
    <div className="flex items-center bg-[#4C1D95] text-white p-4">
      <Icon className="w-6 h-6 mr-3" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// Header Component (Full Width)
const UserProfileHeader = ({ user }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8 flex items-center w-full">
    <div className="flex-shrink-0">
      <UserCircleIcon className="h-20 w-20 text-gray-300" />
    </div>
    <div className="ml-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {user ? capitalize(user.name) : "Loading..."}
      </h2>
      <p className="text-sm text-gray-500">
        {user ? user.email : "Loading..."}
      </p>
    </div>
  </div>
);

const UserDetail = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    vark_type: "visual",
    password: "",
    passwordConfirm: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/detail`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok)
          throw new Error("Failed to fetch user details. Please try again.");
        const data = await res.json();

        if (data && data.userDetail) {
          setUser(data.userDetail);
          setFormData({
            name: data.userDetail.name || "",
            email: data.userDetail.email || "",
            vark_type: data.userDetail.vark_type || "visual",
            password: "",
            passwordConfirm: "",
          });
        } else {
          throw new Error("Received invalid user data from server.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVarkChange = (varkType) => {
    setFormData((prev) => ({ ...prev, vark_type: varkType }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    if (formData.password && formData.password !== formData.passwordConfirm) {
      setSaveError("Passwords do not match.");
      setIsSaving(false);
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      vark_type: formData.vark_type,
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save changes.");
      }

      const updatedUser = await res.json();
      setUser(updatedUser.userDetail);
      setFormData({
        name: updatedUser.userDetail.name,
        email: updatedUser.userDetail.email,
        vark_type: updatedUser.userDetail.vark_type,
        password: "",
        passwordConfirm: "",
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="w-16 h-16 border-4 border-t-4 border-[#4C1D95] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-red-600">
          <ExclamationTriangleIcon className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">Error</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (user) {
      return (
        <form onSubmit={handleSave} className="p-8">
          {/* --- 1. HEADER SECTION (FULL WIDTH) --- */}
          {/* Using formData here allows it to preview changes live, or use user.name to stay static */}
          <UserProfileHeader
            user={{
              ...user,
              email: formData.email,
              name: formData.name,
            }}
          />

          {/* --- 2. GRID LAYOUT FOR REMAINING CONTENT --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            {/* --- LEFT COLUMN (VARK) - 1/3 WIDTH --- */}
            <div className="lg:col-span-1">
              <SettingsCard
                title="Learning Preferences"
                Icon={EyeIcon}
                className="h-full" // Ensures it stretches if the right column is taller
              >
                <p className="text-sm text-gray-600 mb-4">
                  Select your primary learning style to help us personalize your
                  notes.
                </p>
                <div className="space-y-4">
                  <VarkOption
                    Icon={EyeIcon}
                    title="Visual"
                    description="Prefers diagrams, charts, and visual aids."
                    isActive={formData.vark_type === "visual"}
                    onClick={() => handleVarkChange("visual")}
                  />
                  <VarkOption
                    Icon={MusicalNoteIcon}
                    title="Auditory"
                    description="Prefers listening, discussion, and verbal recall."
                    isActive={formData.vark_type === "auditory"}
                    onClick={() => handleVarkChange("auditory")}
                  />
                  <VarkOption
                    Icon={DocumentTextIcon}
                    title="Read/Write"
                    description="Prefers reading text, writing summaries, and lists."
                    isActive={formData.vark_type === "read-write"}
                    onClick={() => handleVarkChange("read-write")}
                  />
                  <VarkOption
                    Icon={SparklesIcon}
                    title="Kinesthetic"
                    description="Prefers hands-on experience, and learning by doing."
                    isActive={formData.vark_type === "kinesthetic"}
                    onClick={() => handleVarkChange("kinesthetic")}
                  />
                </div>
              </SettingsCard>
            </div>

            {/* --- RIGHT COLUMN (FORMS) - 2/3 WIDTH --- */}
            <div className="lg:col-span-2 flex flex-col">
              <SettingsCard title="Edit Profile" Icon={PencilIcon}>
                <StyledInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
                <StyledInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </SettingsCard>

              <SettingsCard title="Change Password" Icon={LockClosedIcon}>
                <StyledInput
                  label="New Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current"
                />
                <StyledInput
                  label="Confirm New Password"
                  name="passwordConfirm"
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
              </SettingsCard>

              <SettingsCard title="Account Details" Icon={IdentificationIcon}>
                <div className="flex items-center mb-4">
                  <IdentificationIcon className="w-5 h-5 mr-3 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      User ID
                    </span>
                    <span className="block text-lg font-semibold text-gray-900">
                      {user.id}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarDaysIcon className="w-5 h-5 mr-3 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Member Since
                    </span>
                    <span className="block text-lg font-semibold text-gray-900">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
              </SettingsCard>
            </div>
          </div>

          {/* --- SAVE BUTTON (Fixed at bottom of content area) --- */}
          <div className="flex items-center mt-4 border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={isSaving || saveSuccess}
              className={`rounded-md cursor-pointer select-none text-white font-semibold py-2 px-6 flex items-center justify-center transition-all duration-300 ${
                isSaving
                  ? "bg-gray-400"
                  : saveSuccess
                  ? "bg-green-600"
                  : "bg-gradient-to-r from-[#4C1D95] via-[#312E81] to-[#1E1B4B] hover:opacity-90"
              }`}
            >
              {isSaving ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
              ) : saveSuccess ? (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              ) : null}
              {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
            </button>
            {saveError && (
              <span className="ml-4 text-sm text-red-600">{saveError}</span>
            )}
          </div>
        </form>
      );
    }
    return null;
  };

  return (
    <div className="flex w-full h-screen">
      <SideBar />
      <div className="w-[84vw] h-full flex-col">
        {/* Title Group */}
        <div className="Title-group h-[10%] flex flex-col justify-center px-9 bg-white border-b border-gray-200">
          <h1 className="text-3xl font-bold text-[#4C1D95] mb-1">
            My Profile
          </h1>
          <p className="text-sm text-black/60 pt-1">
            Manage your account details and learning preferences.
          </p>
        </div>

        {/* Main Content */}
        <div className="Main-content flex h-[90%] border-l-[1px] border-[#6B7280]/30 overflow-y-auto bg-[#faf8fe]">
          <div className="w-full h-full">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;