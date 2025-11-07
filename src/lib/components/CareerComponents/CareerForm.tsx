"use client"

import { useEffect, useRef, useState } from "react";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "./CareerActionModal";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";
import ProgressHeader from "./ProgressHeader";
  // Setting List icons
  const screeningSettingList = [
    {
        name: "Good Fit and above",
        icon: "la la-check",
    },
    {
        name: "Only Strong Fit",
        icon: "la la-check-double",
    },
    {
        name: "No Automatic Promotion",
        icon: "la la-times",
    },
];
const workSetupOptions = [
    {
        name: "Fully Remote",
    },
    {
        name: "Onsite",
    },
    {
        name: "Hybrid",
    },
];

const employmentTypeOptions = [
    {
        name: "Full-Time",
    },
    {
        name: "Part-Time",
    },
];

export default function CareerForm({ career, formType, setShowEditModal }: { career?: any, formType: string, setShowEditModal?: (show: boolean) => void }) {
    const { user, orgID } = useAppContext();
    const [jobTitle, setJobTitle] = useState(career?.jobTitle || "");
    const [description, setDescription] = useState(career?.description || "");
    const [workSetup, setWorkSetup] = useState(career?.workSetup || "");
    const [workSetupRemarks, setWorkSetupRemarks] = useState(career?.workSetupRemarks || "");
    const [screeningSetting, setScreeningSetting] = useState(career?.screeningSetting || "Good Fit and above");
    const [employmentType, setEmploymentType] = useState(career?.employmentType || "");
    const [requireVideo, setRequireVideo] = useState(career?.requireVideo || true);
    const [salaryNegotiable, setSalaryNegotiable] = useState(career?.salaryNegotiable || true);
    const [minimumSalary, setMinimumSalary] = useState(career?.minimumSalary || "");
    const [maximumSalary, setMaximumSalary] = useState(career?.maximumSalary || "");
    const [questions, setQuestions] = useState(career?.questions || [
      {
        id: 1,
        category: "CV Validation / Experience",
        questionCountToAsk: null,
        questions: [],
      },
      {
        id: 2,
        category: "Technical",
        questionCountToAsk: null,
        questions: [],
      },
      {
        id: 3,
        category: "Behavioral",
        questionCountToAsk: null,
        questions: [],
      },
      {
        id: 4,
        category: "Analytical",
        questionCountToAsk: null,
        questions: [],
      },
      {
        id: 5,
        category: "Others",
        questionCountToAsk: null,
        questions: [],
      },
    ]);
    const [country, setCountry] = useState(career?.country || "Philippines");
    const [province, setProvince] = useState(career?.province ||"Choose Province");
    const [city, setCity] = useState(career?.location || "");
    const [provinceList, setProvinceList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState("");
    const [isSavingCareer, setIsSavingCareer] = useState(false);
    const savingCareerRef = useRef(false);
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const [showValidation, setShowValidation] = useState(false);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [showAddMemberDropdown, setShowAddMemberDropdown] = useState(false);
    const [availableMembers, setAvailableMembers] = useState<any[]>([]);
    const addMemberDropdownRef = useRef<HTMLDivElement>(null);


  const isFormValid = () => {
    // Step-aware validation: Team Access and Questions are NOT required on Step 1
    if (step === 1) {
      const hasJobTitle = jobTitle?.trim().length > 0;
      const hasDescription = description?.trim().length > 0;
      const hasEmploymentType = employmentType?.trim().length > 0;
      const hasWorkSetup = workSetup?.trim().length > 0;
      const hasProvince = province && province !== "Choose Province";
      const hasCity = city?.trim().length > 0;
      return hasJobTitle && hasDescription && hasEmploymentType && hasWorkSetup && hasProvince && hasCity;
    }

    // For later steps, fall back to original strict validation (including questions)
    return (
      jobTitle?.trim().length > 0 &&
      description?.trim().length > 0 &&
      questions.some((q) => q.questions.length > 0) &&
      workSetup?.trim().length > 0
    );
  }

    const updateCareer = async (status: string) => {
        if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
            errorToast("Minimum salary cannot be greater than maximum salary", 1300);
            return;
        }
        let userInfoSlice = {
            image: user.image,
            name: user.name,
            email: user.email,
        };
        const updatedCareer = {
            _id: career._id,
            jobTitle,
            description,
            workSetup,
            workSetupRemarks,
            questions,
            lastEditedBy: userInfoSlice,
            status,
            updatedAt: Date.now(),
            screeningSetting,
            requireVideo,
            salaryNegotiable,
            minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
            maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
            country,
            province,
            // Backwards compatibility
            location: city,
            employmentType,
        }
        try {
            setIsSavingCareer(true);
            const response = await axios.post("/api/update-career", updatedCareer);
            if (response.status === 200) {
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career updated</span>
                    </div>,
                    1300,
                <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
                setTimeout(() => {
                    window.location.href = `/recruiter-dashboard/careers/manage/${career._id}`;
                }, 1300);
            }
        } catch (error) {
            console.error(error);
            errorToast("Failed to update career", 1300);
        } finally {
            setIsSavingCareer(false);
        }
    }



  
    const confirmSaveCareer = (status: string) => {
        if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
        errorToast("Minimum salary cannot be greater than maximum salary", 1300);
        return;
        }

        setShowSaveModal(status);
    }

    const saveCareer = async (status: string) => {
        setShowSaveModal("");
        if (!status) {
          return;
        }

        if (!savingCareerRef.current) {
        setIsSavingCareer(true);
        savingCareerRef.current = true;
        let userInfoSlice = {
            image: user.image,
            name: user.name,
            email: user.email,
        };
        const career = {
            jobTitle,
            description,
            workSetup,
            workSetupRemarks,
            questions,
            lastEditedBy: userInfoSlice,
            createdBy: userInfoSlice,
            screeningSetting,
            orgID,
            requireVideo,
            salaryNegotiable,
            minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
            maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
            country,
            province,
            // Backwards compatibility
            location: city,
            status,
            employmentType,
        }

      

        try {
            
            const response = await axios.post("/api/add-career", career);
            if (response.status === 200) {
            candidateActionToast(
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career added {status === "active" ? "and published" : ""}</span>
                </div>,
                1300, 
            <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
            setTimeout(() => {
                window.location.href = `/recruiter-dashboard/careers`;
            }, 1300);
            }
        } catch (error) {
            errorToast("Failed to add career", 1300);
        } finally {
            savingCareerRef.current = false;
            setIsSavingCareer(false);
        }
      }
    }

    const handleSaveAndContinue = async () => {
    if (!isFormValid()) {
      setShowValidation(true); // trigger red borders + validation messages
      const invalidFields = document.querySelectorAll('.form-control');
      invalidFields.forEach((field) => {
        const inputField = field as HTMLInputElement;
        // Mark empty or whitespace-only inputs as invalid
        if (!inputField.value || !inputField.value.trim()) {
          inputField.style.border = '1px solid #EF4444';
        } else {
          // Reset border for now-valid inputs
          inputField.style.border = '';
        }
      });
      return;
    }

        // Save data temporarily as "draft" or "inactive"
        await saveCareer("draft");

        // Move to next step in the progress header
        handleNext();
      };

    useEffect(() => {
        const parseProvinces = () => {
          setProvinceList(philippineCitiesAndProvinces.provinces);
          // Only set default values if career data exists
          if (career?.province) {
            const provinceObj = philippineCitiesAndProvinces.provinces.find((p) => p.name === career.province);
            if (provinceObj) {
              const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === provinceObj.key);
              setCityList(cities);
            }
          }
        }
        parseProvinces();
      },[career])

    // Initialize current user as Job Owner immediately, or use placeholder
    useEffect(() => {
        setTeamMembers((prev) => {
            // If no members exist, initialize
            if (prev.length === 0) {
                if (user && user.email) {
                    // Use actual user data if available
                    return [{
                        email: user.email,
                        name: user.name || "Unknown User",
                        image: user.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${user.email}`,
                        role: "Job Owner"
                    }];
                } else {
                    // Use placeholder for unknown user when bypassing admin
                    return [{
                        email: "unknown@example.com",
                        name: "Unknown User",
                        image: "https://api.dicebear.com/9.x/shapes/svg?seed=unknown",
                        role: "Job Owner"
                    }];
                }
            }
            
            // Replace placeholder user if real user becomes available
            const hasPlaceholder = prev.some(m => m.email === "unknown@example.com");
            if (hasPlaceholder && user && user.email) {
                return prev.map(m => 
                    m.email === "unknown@example.com" 
                        ? {
                            email: user.email,
                            name: user.name || "Unknown User",
                            image: user.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${user.email}`,
                            role: "Job Owner"
                        }
                        : m
                );
            }
            
            // Update existing user if user data changes
            if (user && user.email) {
                const existingUserIndex = prev.findIndex(m => m.email === user.email);
                if (existingUserIndex >= 0) {
                    return prev.map((m, index) => 
                        index === existingUserIndex
                            ? {
                                ...m,
                                name: user.name || m.name,
                                image: user.image || m.image,
                                role: m.role || "Job Owner"
                            }
                            : m
                    );
                }
            }
            
            return prev;
        });
    }, [user]);

    // Mock data for development/testing
    const getMockMembers = () => {
        const mockMembers = [
            {
                email: "sabine@whitecloak.com",
                name: "Sabine Beatrix Dy",
                image: "https://api.dicebear.com/9.x/shapes/svg?seed=sabine@whitecloak.com",
                role: "admin"
            },
            {
                email: "john.doe@whitecloak.com",
                name: "John Doe",
                image: "https://api.dicebear.com/9.x/shapes/svg?seed=john.doe@whitecloak.com",
                role: "hiring_manager"
            },
            {
                email: "jane.smith@whitecloak.com",
                name: "Jane Smith",
                image: "https://api.dicebear.com/9.x/shapes/svg?seed=jane.smith@whitecloak.com",
                role: "hiring_manager"
            }
        ];
        
        // Add current user if not in mock data
        if (user && user.email && !mockMembers.some(m => m.email === user.email)) {
            mockMembers.unshift({
                email: user.email,
                name: user.name,
                image: user.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${user.email}`,
                role: "admin"
            });
        }
        
        return mockMembers;
    };

    // Fetch all members from organization
    useEffect(() => {
        const fetchMembers = async () => {
            // Use mock data if orgID is not available (bypassing admin side)
            if (!orgID) {
                const mockMembers = getMockMembers();
                setAvailableMembers(mockMembers);
                return;
            }

            try {
                const response = await axios.get("/api/search-members", {
                    params: {
                        orgID,
                        page: 1,
                        limit: 100,
                    },
                });
                setAvailableMembers(response.data.members || []);
                
                // Update current user member with data from API if available
                if (user && user.email) {
                    const apiMember = response.data.members?.find((m: any) => m.email === user.email);
                    if (apiMember) {
                        // Update with API data but keep role as "Job Owner"
                        setTeamMembers((prev) => {
                            return prev.map((m) => 
                                m.email === user.email 
                                    ? { ...apiMember, role: "Job Owner" }
                                    : m
                            );
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch members:", error);
                // Fall back to mock data on error
                const mockMembers = getMockMembers();
                setAvailableMembers(mockMembers);
            }
        };
        fetchMembers();
    }, [orgID, user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addMemberDropdownRef.current && !addMemberDropdownRef.current.contains(event.target as Node)) {
                setShowAddMemberDropdown(false);
            }
        };

        if (showAddMemberDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAddMemberDropdown]);

    const roleOptions = [
        { name: "Job Owner" },
        { name: "Admin" },
        { name: "Hiring Manager" },
    ];

    const handleAddMember = (member: any) => {
        if (!teamMembers.some((m) => m.email === member.email)) {
            setTeamMembers([...teamMembers, { ...member, role: "Hiring Manager" }]);
        }
        setShowAddMemberDropdown(false);
    };

    const handleRemoveMember = (email: string) => {
        setTeamMembers(teamMembers.filter((m) => m.email !== email));
    };

    const handleRoleChange = (email: string, role: string) => {
        setTeamMembers(teamMembers.map((m) => 
            m.email === email ? { ...m, role } : m
        ));
    };

    const getAvailableMembersToAdd = () => {
        return availableMembers.filter((m) => 
            !teamMembers.some((tm) => tm.email === m.email)
        );
    };

    return (
        <div className="col">
       
          
        {formType === "add" ? (
          <div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Add new career</h1>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                 <button
                      disabled={!isFormValid() || isSavingCareer}
                      style={{
                        width: "fit-content",
                        color: "#414651",
                        background: "#fff",
                        border: "1px solid #D5D7DA",
                        padding: "8px 16px",
                        borderRadius: "60px",
                        cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => handlePrev()}
                    >
                      Save as Unpublished
                    </button>

                    <button
                      disabled={isSavingCareer}
                      onClick={handleSaveAndContinue}
                      style={{
                        width: "fit-content",
                        background: isSavingCareer ? "#D5D7DA" : "black",
                        color: "#fff",
                        border: "1px solid #E9EAEB",
                        padding: "8px 16px",
                        borderRadius: "60px",
                        cursor: isSavingCareer ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "background 0.2s ease"
                      }}
                    >
                      Save and Continue <i className="la la-arrow-right"></i>
                    </button>
                </div>
        </div>) : (
            <div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Edit Career Details</h1>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <button
                    style={{
                      width: "fit-content",
                      color: "#414651",
                      background: "#fff",
                      border: "1px solid #D5D7DA",
                      padding: "8px 16px",
                      borderRadius: "60px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => setShowEditModal?.(false)}
                  >
                    Cancel
                  </button>

                  <button
                    disabled={isSavingCareer} // keep interactive even if invalid; validation handled on click
                    style={{
                      width: "fit-content",
                      background: isSavingCareer ? "#D5D7DA" : "black",
                      color: "#fff",
                      border: "1px solid #E9EAEB",
                      padding: "8px 16px",
                      borderRadius: "60px",
                      cursor: isSavingCareer ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "background 0.2s ease"
                    }}
                    onClick={async () => {
                      // For edit flow, still enforce required fields before proceeding
                      if (!isFormValid()) {
                        setShowValidation(true);
                        const invalidFields = document.querySelectorAll('.form-control');
                        invalidFields.forEach((field) => {
                          const inputField = field as HTMLInputElement;
                          if (!inputField.value || !inputField.value.trim()) {
                            inputField.style.border = '1px solid #EF4444';
                          } else {
                            inputField.style.border = '';
                          }
                        });
                        return; // block save until valid
                      }
                      await updateCareer("draft");
                      handleNext();
                    }}
                  >
                    Save and Continue <i className="la la-arrow-right"></i>
                </button>
              </div>
       </div>
        )}

         <ProgressHeader step={step} totalSteps={totalSteps} />
          {step === 1 && (

            <div style={{
              // Made the two columns in the center on larger screens
              display: "flex",  
              justifyContent: "center",
              width: "100%",
              gap: 20,
              alignItems: "flex-start",
              marginTop: 16,
              maxWidth: 1500,
              marginLeft: "auto",
              marginRight: "auto"
            }}>
              {/* Left Section */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

                {/* 1️⃣ Career Information */}
                <div className="layered-card-outer bg-[#F9FAFB] rounded-2xl border border-[#E9EAEB] p-2">
                    <h2 className="text-lg font-semibold text-[#181D27] m-3">1. Career Information</h2>
                  <div className="layered-card-middle bg-white p-4 mb-2">
                  
                    {/* Basic Information */}
                    <div className="mb-16">
                      <h3 className="font-medium text-[#181D27] mb-2">Basic Information</h3>
                      <label className="block text-sm text-[#414651] mb-1">Job Title</label>
                      <input
                        value={jobTitle}
                        className="form-control w-full border border-[#D5D7DA] rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#181D27]"
                        placeholder="Enter job title"
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                      {showValidation && !jobTitle && (
                        <span style={{ color: "#EF4444", fontSize: "12px" }}>This is a required field.</span>
                      )}
                    </div>

                    {/* Work Setting */}
                    <div style={{ marginBottom: 16 }}>
                      <h3 className="font-medium text-[#181D27] mb-2">Work Setting</h3>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <label className="block text-sm text-[#414651] mb-1">Employment Type</label>
                          <CustomDropdown
                            onSelectSetting={(val) => setEmploymentType(val)}
                            screeningSetting={employmentType}
                            settingList={employmentTypeOptions}
                            placeholder="Choose employment type"
                          />
                          {showValidation && !employmentType && (
                            <span style={{ color: "#EF4444", fontSize: "12px" }}>This is a required field.</span>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <label className="block text-sm text-[#414651] mb-1">Arrangement</label>
                          <CustomDropdown
                            onSelectSetting={(val) => setWorkSetup(val)}
                            screeningSetting={workSetup}
                            settingList={workSetupOptions}
                            placeholder="Choose work arrangement"
                          />
                          {showValidation && !workSetup && (
                            <span style={{ color: "#EF4444", fontSize: "12px" }}>This is a required field.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div style={{ marginBottom: 16 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: "#181D27", marginBottom: 8 }}>Location</h3>

                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <label className="block text-sm text-[#414651] mb-1" style={{ fontWeight: 500 }}>Country</label>
                          <CustomDropdown
                            onSelectSetting={(val) => setCountry(val)}
                            screeningSetting={country}
                            settingList={[{ name: "Philippines" }]}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <label className="block text-sm text-[#414651] mb-1" style={{ fontWeight: 500 }}>State / Province</label>
                          <CustomDropdown
                            onSelectSetting={(val) => {
                              setProvince(val);
                              const provinceObj = provinceList.find((p) => p.name === val);
                              const cities = philippineCitiesAndProvinces.cities.filter(
                                (c) => c.province === provinceObj.key
                              );
                              setCityList(cities);
                              setCity(cities[0].name);
                            }}
                            screeningSetting={province}
                            settingList={provinceList}
                            placeholder="Choose state / province"
                          />
                          {showValidation && !province && (
                            <span style={{ color: "#EF4444", fontSize: "12px" }}>This is a required field.</span>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <label className="block text-sm text-[#414651] mb-1" style={{ fontWeight: 500 }}>City</label>
                          <CustomDropdown
                            onSelectSetting={(val) => setCity(val)}
                            screeningSetting={city}
                            settingList={cityList}
                            placeholder="Choose city"
                          />
                          {showValidation && !city && (
                            <span style={{ color: "#EF4444", fontSize: "12px" }}>This is a required field.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Salary */}
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: "#181D27", marginBottom: 8 }}>Salary</h3>
                      <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                        <div style={{ flex: 1 }}>
                          <label className="block text-sm text-[#414651] mb-1" style={{ fontWeight: 500 }}>Minimum Salary</label>
                          <div style={{ display: "flex", gap: 0 }}>
                            <div style={{
                              border: "1px solid #D5D7DA",
                              borderRight: "none",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                              background: "#fff",
                              padding: "8px 12px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: 14,
                              color: "#181D27",
                              fontWeight: 500
                            }}>
                              ₱
                            </div>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="0"
                              min={0}
                              value={minimumSalary}
                              onChange={(e) => setMinimumSalary(e.target.value)}
                              style={{
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                                borderRight: "none",
                                borderLeft: "none",
                                flex: 1
                              }}
                            />
                            <div style={{
                              border: "1px solid #D5D7DA",
                              borderLeft: "none",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              background: "#fff",
                              padding: "8px 12px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: 14,
                              color: "#181D27",
                              fontWeight: 500
                            }}>
                              PHP
                            </div>
                          </div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <label className="block text-sm text-[#414651] mb-1" style={{ fontWeight: 500 }}>Maximum Salary</label>
                          <div style={{ display: "flex", gap: 0 }}>
                            <div style={{
                              border: "1px solid #D5D7DA",
                              borderRight: "none",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                              background: "#fff",
                              padding: "8px 12px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: 14,
                              color: "#181D27",
                              fontWeight: 500
                            }}>
                              ₱
                            </div>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="0"
                              min={0}
                              value={maximumSalary}
                              onChange={(e) => setMaximumSalary(e.target.value)}
                              style={{
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                                borderRight: "none",
                                borderLeft: "none",
                                flex: 1
                              }}
                            />
                            <div style={{
                              border: "1px solid #D5D7DA",
                              borderLeft: "none",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              background: "#fff",
                              padding: "8px 12px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: 14,
                              color: "#181D27",
                              fontWeight: 500
                            }}>
                              PHP
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
                          <label className="switch" style={{ margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={salaryNegotiable}
                              onChange={() => setSalaryNegotiable(!salaryNegotiable)}
                            />
                            <span className="slider round"></span>
                          </label>
                          <span style={{ fontSize: 14, color: "#181D27", fontWeight: 500 }}>Negotiable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2️⃣ Job Description */}
                <div className="layered-card-outer bg-[#F9FAFB] rounded-2xl border border-[#E9EAEB] p-2">
                    <h2 className="text-lg font-semibold text-[#181D27] m-3">2. Job Description</h2>
                  <div className="layered-card-middle bg-white p-4 mb-2">
                  
                    <RichTextEditor setText={setDescription} text={description} />
                    {showValidation && !description && (
                      <span style={{ color: "#EF4444", fontSize: "12px", marginTop: 8, display: "block" }}>This is a required field.</span>
                    )}
                  </div>
                </div>

                {/* 3️⃣ Team Access */}
                <div className="layered-card-outer bg-[#F9FAFB] rounded-2xl border border-[#E9EAEB] p-2 mb-5">
                  <h2 className="text-lg font-semibold text-[#181D27] m-3">3. Team Access</h2>
                  <div className="layered-card-middle bg-white p-4 mb-2">
                    {/* Add more members section */}
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <h3 className="font-medium text-[#181D27] mb-2" style={{ fontWeight: 600 }}>Add more members</h3>
                          <p className="text-sm text-[#666666]" style={{ marginTop: 4 }}>
                            You can add other members to collaborate on this career.
                          </p>
                        </div>
                        <div style={{ position: "relative" }} ref={addMemberDropdownRef}>
                          <button
                            onClick={() => setShowAddMemberDropdown(!showAddMemberDropdown)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 16px",
                              borderRadius: "8px",
                              border: "1px solid #D5D7DA",
                              background: "#F9FAFB",
                              color: "#181D27",
                              cursor: "pointer",
                              fontSize: 14,
                              fontWeight: 500,
                            }}
                          >
                            <i className="la la-user" style={{ fontSize: 16 }}></i>
                            <span>Add member</span>
                            <i className="la la-angle-down" style={{ fontSize: 12 }}></i>
                          </button>
                          {showAddMemberDropdown && (
                            <div
                              style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                marginTop: 8,
                                background: "white",
                                border: "1px solid #D5D7DA",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                minWidth: 200,
                                maxHeight: 300,
                                overflowY: "auto",
                                zIndex: 1000,
                              }}
                            >
                              {getAvailableMembersToAdd().length > 0 ? (
                                getAvailableMembersToAdd().map((member) => (
                                  <button
                                    key={member.email}
                                    onClick={() => handleAddMember(member)}
                                    style={{
                                      width: "100%",
                                      padding: "12px 16px",
                                      border: "none",
                                      background: "transparent",
                                      textAlign: "left",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                      fontSize: 14,
                                      color: "#181D27",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#F9FAFB";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    <img
                                      src={member.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${member.email}`}
                                      alt={member.name}
                                      style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 500 }}>{member.name}</div>
                                      <div style={{ fontSize: 12, color: "#666666" }}>{member.email}</div>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div style={{ padding: "12px 16px", color: "#666666", fontSize: 14 }}>
                                  No available members to add
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Existing members list */}
                    {teamMembers.length > 0 && (
                      <>
                        <div style={{ height: 1, background: "#E9EAEB", marginBottom: 16 }}></div>
                        {teamMembers.map((member) => (
                          <div
                            key={member.email}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginBottom: 16,
                            }}
                          >
                            <img
                              src={member.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${member.email}`}
                              alt={member.name}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: "#181D27", fontSize: 14 }}>
                                {member.name} {member.email === user?.email && user?.email ? "(You)" : ""}
                              </div>
                              <div style={{ fontSize: 13, color: "#666666", marginTop: 2 }}>
                                {member.email === "unknown@example.com" ? "No user available" : member.email}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ minWidth: 150 }}>
                                <CustomDropdown
                                  onSelectSetting={(val) => handleRoleChange(member.email, val)}
                                  screeningSetting={member.role || "Hiring Manager"}
                                  settingList={roleOptions}
                                  placeholder="Select role"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  // Prevent removing the last member
                                  if (teamMembers.length === 1) {
                                    errorToast("Cannot remove the last team member", 1300);
                                    return;
                                  }
                                  // Prevent removing placeholder user if no real user is available
                                  if (member.email === "unknown@example.com" && (!user || !user.email)) {
                                    errorToast("Cannot remove placeholder user when no user is available", 1300);
                                    return;
                                  }
                                  handleRemoveMember(member.email);
                                }}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  border: "1px solid #D5D7DA",
                                  background: "#F9FAFB",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#666666",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#F5F5F5";
                                  e.currentTarget.style.color = "#EF4444";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "#F9FAFB";
                                  e.currentTarget.style.color = "#666666";
                                }}
                              >
                                <i className="la la-trash" style={{ fontSize: 14 }}></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Disclaimer */}
                    <p className="mt-4 text-xs text-[#667085]" style={{ fontStyle: "italic", marginTop: 16 }}>
                      *Admins can view all careers regardless of specific access settings.
                    </p>
                  </div>
                </div>
              
              </div>

              {/* Right Section — Tips */}
              <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="layered-card-outer bg-[#F9FAFB] rounded-2xl border border-[#E9EAEB] p-2" style={{ width: "fit-content", maxWidth: 340, alignSelf: "flex-start" }}>
                  <h3 className="text-lg font-semibold text-[#181D27] m-3">💡 Tips</h3>
                  <div className="layered-card-middle bg-white p-4 mb-2">
                   
                    <ul style={{ paddingLeft: 0, marginTop: 8, color: "#414651", fontSize: 14, listStyle: 'none' }}>
                      <li><span style={{ fontWeight: 600 }}>Use clear, standard job titles</span> for better searchability (e.g., “Software Engineer” instead of “Code Ninja” or “Tech Rockstar”).</li>
                      <li style={{ marginTop: 8 }}><span style={{ fontWeight: 600 }}>Avoid abbreviations</span> or internal role codes that applicants may not understand (e.g., use “QA Engineer” instead of “QE II” or “QA-TL”).</li>
                      <li style={{ marginTop: 8 }}><span style={{ fontWeight: 600 }}>Keep it concise</span> — job titles should be no more than a few words (2–4 max), avoiding fluff or marketing terms.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
      
      {showSaveModal && (
         <CareerActionModal action={showSaveModal} onAction={(action) => saveCareer(action)} />
        )}
    {isSavingCareer && (
        <FullScreenLoadingAnimation title={formType === "add" ? "Saving career..." : "Updating career..."} subtext={`Please wait while we are ${formType === "add" ? "saving" : "updating"} the career`} />
    )}
    </div>
    )
}