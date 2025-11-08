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
import Step1CareerDetails from "./steps/Step1CareerDetails";
import Step2CVReview from "./steps/Step2CVReview";
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
  // Step 2: Pre-screening questions (local only for now)
  const [preScreeningQuestions, setPreScreeningQuestions] = useState<any[]>([]);
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
              <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>{step > 1 ? `[Draft] ${jobTitle?.trim() || "Untitled Role"}` : "Add new career"}</h1>
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
            <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>{step > 1 ? `[Draft] ${jobTitle?.trim() || "Untitled Role"}` : "Edit Career Details"}</h1>
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

         {/* Progress header now supports a half-progress (50%) state before advancing */}
         <ProgressHeader
           step={step}
           totalSteps={totalSteps}
           currentStepPartial={(() => {
             if (step === 1) {
               const hasJobTitle = jobTitle?.trim().length > 0;
               const hasDescription = description?.trim().length > 0;
               const hasEmploymentType = employmentType?.trim().length > 0;
               const hasWorkSetup = workSetup?.trim().length > 0;
               const hasProvince = province && province !== "Choose Province";
               const hasCity = city?.trim().length > 0;
               return hasJobTitle && hasDescription && hasEmploymentType && hasWorkSetup && hasProvince && hasCity;
             }
             return false;
           })()}
           forceStep2Half={step === 2} /* show half connector toward step 3 only when exactly on step 2 */
         />
          {/* Separator */}
					<div className="max-w-full mx-auto" style={{ height: 1, background: '#E9EAEB', width: '85%', marginBottom: 20 }} />
          {step === 1 && (
             <Step1CareerDetails
                    jobTitle={jobTitle}
                    setJobTitle={setJobTitle}
                    description={description}
                    setDescription={setDescription}
                    employmentType={employmentType}
                    setEmploymentType={setEmploymentType}
                    workSetup={workSetup}
                    setWorkSetup={setWorkSetup}
                    country={country}
                    setCountry={setCountry}
                    province={province}
                    setProvince={setProvince}
                    city={city}
                    setCity={setCity}
                    provinceList={provinceList}
                    cityList={cityList}
                    setCityList={setCityList}
                    philippineCitiesAndProvinces={philippineCitiesAndProvinces}
                    salaryNegotiable={salaryNegotiable}
                    setSalaryNegotiable={setSalaryNegotiable}
                    minimumSalary={minimumSalary}
                    setMinimumSalary={setMinimumSalary}
                    maximumSalary={maximumSalary}
                    setMaximumSalary={setMaximumSalary}
                    showValidation={showValidation}
                    teamMembers={teamMembers}
                    availableMembers={availableMembers}
                    user={user}
                    roleOptions={roleOptions}
                    handleRoleChange={handleRoleChange}
                    handleAddMember={handleAddMember}
                    handleRemoveMember={handleRemoveMember}
                    getAvailableMembersToAdd={getAvailableMembersToAdd}
                    addMemberDropdownRef={addMemberDropdownRef}
                    showAddMemberDropdown={showAddMemberDropdown}
                    setShowAddMemberDropdown={setShowAddMemberDropdown}
                  />     
          )}
          {step === 2 && (
            // Step 2 (CV Review & Pre-Screening)
            <Step2CVReview
              screeningSetting={screeningSetting}
              onChangeScreeningSetting={(val) => setScreeningSetting(val)}
              preScreeningQuestions={preScreeningQuestions}
              setPreScreeningQuestions={setPreScreeningQuestions}
            />
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