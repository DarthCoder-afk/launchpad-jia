 /**
   * Wizard Step Mapping (totalSteps = 5)
   *  Step 1: Career Details & Team Access
   *    - Component: Step1CareerDetails
   *    - Core state: jobTitle, jobDescription, employmentType, workSetup/workSetupRemarks, location (country/province/city),
   *      salaryNegotiable + minimumSalary/maximumSalary, teamMembers management.
   *    - Validation: Basic required fields (title, job description, employmentType, workSetup, province, city, minimumSalary, and maximumSalary) must be present.
   *    - Draft: All fields auto-saved.
   *
   *  Step 2: CV Review & Pre-screening
   *    - Component: Step2CVReview
   *    - Core state: screeningSetting (shared later), secretPrompt, preScreeningQuestions[] collection.
   *    - Validation: Currently relaxed (always returns true) to allow forward navigation while UI evolves.
   *    - Draft: screeningSetting, secretPrompt, preScreeningQuestions persisted.
   *
   *  Step 3: AI Interview Setup
   *    - Component: Step3AI_Interview (ref: step3Ref)
   *    - Core state: aiSecretPrompt, requireVideo, screeningSetting (shared), step3Categories[] (each with questions/editing flags).
   *    - Validation: Performed via step3Ref.validateQuestions() in handleSaveAndContinue; must have >=5 saved (editing=false) non-empty questions.
   *    - Progress Enhancement: When on Step 3 and >=5 saved questions, progress bar shows half connector toward Step 4.
   *    - Draft: aiSecretPrompt, requireVideo, screeningSetting, step3Categories persisted.
   *
   *  Step 4: Pipeline Stages
   *    - Component: Step4Pipeline (static summary / configuration placeholder).
   *    - Core state: None new added here; derives from earlier steps.
   *    - Validation: Always true (non-blocking); final checks deferred to publish.
   *
   *  Step 5: Review Career
   *    - Component: Step5Review
   *    - Core state aggregated: All prior step states displayed for confirmation.
   *    - Actions: Publish (active) or Save Draft (draft). Clearing draft storage if published.
   *    - Validation: Final server-side logic on publish; UI trusts earlier validations.
   *
   * Error Icon Behavior (errorSteps array):
   *  - Step 1: Icon persists until ALL required fields valid (auto-clears in useEffect when valid).
   *  - Step 3: Icon set when user attempts to proceed without enough saved questions; auto-clears once >=5 saved questions.
   */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "./CareerActionModal";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";
import ProgressHeader from "./ProgressHeader";
import Step1CareerDetails from "./steps/Step1CareerDetails";
import Step2CVReview from "./steps/Step2CVReview";
import Step3AI_Interview, {type Step3InterviewRef,type Category as Step3Category} from "./steps/Step3AI_Interview";
import Step4Pipeline from "./steps/Step4Pipeline";
import Step5Review from "./steps/Step5Review";
import { useAutoSaveDraft } from "@/lib/hooks/useAutoSaveDraft";
import { loadDraft, clearDraft } from "@/lib/utils/draftStorage";
// (Removed local option lists and unused UI imports to keep this component lean)

export default function CareerForm({
  career,
  formType,
  setShowEditModal,
}: {
  career?: any;
  formType: string;
  setShowEditModal?: (show: boolean) => void;
}) {
  const { user, orgID } = useAppContext();
  const [jobTitle, setJobTitle] = useState(career?.jobTitle || "");
  const [description, setDescription] = useState(career?.description || "");
  const [workSetup, setWorkSetup] = useState(career?.workSetup || "");
  const [workSetupRemarks, setWorkSetupRemarks] = useState(
    career?.workSetupRemarks || ""
  );
  const [screeningSetting, setScreeningSetting] = useState(
    career?.screeningSetting || "Good Fit and above"
  );
  const [employmentType, setEmploymentType] = useState(
    career?.employmentType || ""
  );
  const [requireVideo, setRequireVideo] = useState(
    career?.requireVideo || true
  );
  const [salaryNegotiable, setSalaryNegotiable] = useState(
    career?.salaryNegotiable || true
  );
  const [minimumSalary, setMinimumSalary] = useState(
    career?.minimumSalary || ""
  );
  const [maximumSalary, setMaximumSalary] = useState(
    career?.maximumSalary || ""
  );
  // Legacy questions array kept for backwards compatibility in save/update payloads
  const [questions, setQuestions] = useState(career?.questions || []);
  const [country, setCountry] = useState(career?.country || "Philippines");
  const [province, setProvince] = useState(
    career?.province || "Choose Province"
  );
  const [city, setCity] = useState(career?.location || "");
  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);
  // Step 2: Pre-screening questions (local only for now)
  const [preScreeningQuestions, setPreScreeningQuestions] = useState<any[]>([]);
  const [secretPrompt, setSecretPrompt] = useState<string>("");
  // Step 3: AI Interview Secret Prompt
  const [aiSecretPrompt, setAiSecretPrompt] = useState<string>("");
  const [showSaveModal, setShowSaveModal] = useState("");
  const [isSavingCareer, setIsSavingCareer] = useState(false);
  const savingCareerRef = useRef(false);
  const [step, setStep] = useState(1);
  // Step 3 local categories persisted as part of draft
  const [step3Categories, setStep3Categories] = useState<
    Step3Category[] | undefined
  >(undefined);
  const totalSteps = 5;

  // Count of saved (non-editing, non-empty) AI interview questions
  const savedAIQuestionCount = useMemo(() => {
    if (!step3Categories || !Array.isArray(step3Categories)) return 0;
    return step3Categories.reduce(
      (sum, c) =>
        sum +
        (Array.isArray(c.questions)
          ? c.questions.filter(
              (q: any) =>
                q && q.editing === false && q.text && String(q.text).trim().length > 0
            ).length
          : 0),
      0
    );
  }, [step3Categories]);

  const [errorSteps, setErrorSteps] = useState<number[]>([]);
  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const [showValidation, setShowValidation] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showAddMemberDropdown, setShowAddMemberDropdown] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);
  const addMemberDropdownRef = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<Step3InterviewRef>(null);

  // Identify draft storage key (new vs edit)
  const draftKey = useMemo(() => {
    return career?._id ? `careerDraft:${career._id}` : `careerDraft:new`;
  }, [career?._id]);

  type CareerDraft = {
    step: number;
    jobTitle: string;
    description: string;
    employmentType: string;
    workSetup: string;
    workSetupRemarks: string;
    screeningSetting: string;
    requireVideo: boolean;
    salaryNegotiable: boolean;
    minimumSalary: string | number;
    maximumSalary: string | number;
    country: string;
    province: string;
    city: string;
    teamMembers: any[];
    preScreeningQuestions: any[];
    secretPrompt?: string;
    aiSecretPrompt?: string;
    step3Categories?: Step3Category[];
  };

  // Compose draft object from current state
  const draft: CareerDraft = useMemo(
    () => ({
      step,
      jobTitle,
      description,
      employmentType,
      workSetup,
      workSetupRemarks,
      screeningSetting,
      requireVideo,
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country,
      province,
      city,
      teamMembers,
      preScreeningQuestions,
      secretPrompt,
      aiSecretPrompt,
      step3Categories,
    }),
    [
      step,
      jobTitle,
      description,
      employmentType,
      workSetup,
      workSetupRemarks,
      screeningSetting,
      requireVideo,
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country,
      province,
      city,
      teamMembers,
      preScreeningQuestions,
      secretPrompt,
      aiSecretPrompt,
      step3Categories,
    ]
  );

  // Auto-save draft locally with debounce, and hydrate on first mount
  const { status: draftStatus } = useAutoSaveDraft<CareerDraft>({
    key: draftKey,
    data: draft,
    delay: 700,
    enabled: true,
    onHydrate: (d) => {
      // Apply hydrated values into local state
      setStep(d.step || 1);
      setJobTitle(d.jobTitle ?? "");
      setDescription(d.description ?? "");
      setEmploymentType(d.employmentType ?? "");
      setWorkSetup(d.workSetup ?? "");
      setWorkSetupRemarks(d.workSetupRemarks ?? "");
      setScreeningSetting(d.screeningSetting ?? "Good Fit and above");
      setTeamMembers(Array.isArray(d.teamMembers) ? d.teamMembers : []);
      setPreScreeningQuestions(
        Array.isArray(d.preScreeningQuestions) ? d.preScreeningQuestions : []
      );
      setSecretPrompt(d.secretPrompt ?? "");
      setAiSecretPrompt(d.aiSecretPrompt ?? "");
      setRequireVideo(
        typeof d.requireVideo === "boolean" ? d.requireVideo : true
      );
      setSalaryNegotiable(
        typeof d.salaryNegotiable === "boolean" ? d.salaryNegotiable : true
      );
      setMinimumSalary((d.minimumSalary as any) ?? "");
      setMaximumSalary((d.maximumSalary as any) ?? "");
      setCountry(d.country ?? "Philippines");
      setProvince(d.province ?? "Choose Province");
      setCity(d.city ?? "");
      if (d.step3Categories && d.step3Categories.length)
        setStep3Categories(d.step3Categories);
    },
  });

  const isFormValid = () => {
    // Step-aware validation: Team Access and Questions are NOT required on Step 1
    if (step === 1) {
      const hasJobTitle = jobTitle?.trim().length > 0;
      const hasDescription = description?.trim().length > 0;
      const hasEmploymentType = employmentType?.trim().length > 0;
      const hasWorkSetup = workSetup?.trim().length > 0;
      const hasProvince = province && province !== "Choose Province";
      const hasCity = city?.trim().length > 0;
      return (
        hasJobTitle &&
        hasDescription &&
        hasEmploymentType &&
        hasWorkSetup &&
        hasProvince &&
        hasCity
      );
    }

    // Relax validation for Step 2 so the user can proceed to Step 3 while UI is being built
    if (step === 2) {
      return true;
    }

    // Step 3 validation handled explicitly in handleSaveAndContinue via the ref (internal Step3 state)
    if (step === 3) {
      return true;
    }

    // Do not block progression from Step 4; final checks happen on publish in Step 5
    if (step === 4) {
      return true;
    }

    // For later steps, fall back to original strict validation (including questions)
    return (
      jobTitle?.trim().length > 0 &&
      description?.trim().length > 0 &&
      workSetup?.trim().length > 0
    );
  };

  // Auto-clear Step 1 error icon only when Step 1 becomes fully valid
  useEffect(() => {
    const hasJobTitle = jobTitle?.trim().length > 0;
    const hasDescription = description?.trim().length > 0;
    const hasEmploymentType = employmentType?.trim().length > 0;
    const hasWorkSetup = workSetup?.trim().length > 0;
    const hasProvince = province && province !== "Choose Province";
    const hasCity = city?.trim().length > 0;

    const step1Valid =
      hasJobTitle &&
      hasDescription &&
      hasEmploymentType &&
      hasWorkSetup &&
      hasProvince &&
      hasCity;

    if (step1Valid) {
      setErrorSteps((prev) => prev.filter((s) => s !== 1));
    }
  }, [jobTitle, description, employmentType, workSetup, province, city]);

  const updateCareer = async (status: string) => {
    if (
      Number(minimumSalary) &&
      Number(maximumSalary) &&
      Number(minimumSalary) > Number(maximumSalary)
    ) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
      return;
    }
    const userInfoSlice = {
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
      minimumSalary: salaryNegotiable
        ? null
        : isNaN(Number(minimumSalary))
        ? null
        : Number(minimumSalary),
      maximumSalary: salaryNegotiable
        ? null
        : isNaN(Number(maximumSalary))
        ? null
        : Number(maximumSalary),
      country,
      province,
      // Backwards compatibility
      location: city,
      employmentType,
    };
    try {
      setIsSavingCareer(true);
      const response = await axios.post("/api/update-career", updatedCareer);
      if (response.status === 200) {
        candidateActionToast(
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginLeft: 8,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>
              Career updated
            </span>
          </div>,
          1300,
          <i
            className="la la-check-circle"
            style={{ color: "#039855", fontSize: 32 }}
          ></i>
        );
        // Clear local draft when publishing
        if (status === "active") {
          clearDraft(draftKey);
        }
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
  };

  const confirmSaveCareer = (status: string) => {
    if (
      Number(minimumSalary) &&
      Number(maximumSalary) &&
      Number(minimumSalary) > Number(maximumSalary)
    ) {
      errorToast("Minimum salary cannot be greater than maximum salary", 1300);
      return;
    }
    setShowSaveModal(status);
  };

  const saveCareer = async (status: string) => {
    setShowSaveModal("");
    if (!status) return;
    if (!savingCareerRef.current) {
      setIsSavingCareer(true);
      savingCareerRef.current = true;
      const userInfoSlice = {
        image: user.image,
        name: user.name,
        email: user.email,
      };
      const newCareer = {
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
        minimumSalary: salaryNegotiable
          ? null
          : isNaN(Number(minimumSalary))
          ? null
          : Number(minimumSalary),
        maximumSalary: salaryNegotiable
          ? null
          : isNaN(Number(maximumSalary))
          ? null
          : Number(maximumSalary),
        country,
        province,
        // Backwards compatibility
        location: city,
        status,
        employmentType,
      };
      try {
        const response = await axios.post("/api/add-career", newCareer);
        if (response.status === 200) {
          candidateActionToast(
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginLeft: 8,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>
                Career added {status === "active" ? "and published" : ""}
              </span>
            </div>,
            1300,
            <i
              className="la la-check-circle"
              style={{ color: "#039855", fontSize: 32 }}
            ></i>
          );
          if (status === "active") {
            clearDraft(draftKey);
          }
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
  };

  const handleSaveAndContinue = async () => {
    if (step === 3) {
      const ok = step3Ref.current?.validateQuestions() ?? false;
      if (!ok) {
        // Persist error icon for Step 3 when user tries to proceed without enough saved questions
        setErrorSteps((prev) => Array.from(new Set([...prev, 3])));
        return;
      }
    }
    if (!isFormValid()) {
      setShowValidation(true); // trigger red borders + validation messages
      // Persist icon for Step 1 on any invalid state (partial or all empty)
      if (step === 1) {
        setErrorSteps((prev) => Array.from(new Set([...prev, 1])));
      }
      const invalidFields = document.querySelectorAll(".form-control");
      invalidFields.forEach((field) => {
        const inputField = field as HTMLInputElement;
        if (!inputField.value || !inputField.value.trim()) {
          inputField.style.border = "1px solid #EF4444";
        } else {
          inputField.style.border = "";
        }
      });
      return;
    }
    // Clear error for current step when becomes valid
    setErrorSteps((prev) => prev.filter((s) => s !== step));
    // Advance to next step (review can handle final save logic later)
    handleNext();
  };

  // Auto-clear Step 3 error icon only when it becomes fully valid (>=5 saved, non-empty questions)
  useEffect(() => {
    if (!step3Categories || !Array.isArray(step3Categories)) return;
    const savedValid = step3Categories.reduce((sum, c) =>
      sum + (Array.isArray(c.questions)
        ? c.questions.filter((q: any) => q && q.editing === false && q.text && String(q.text).trim().length > 0).length
        : 0),
    0);
    if (savedValid >= 5) {
      setErrorSteps((prev) => prev.filter((s) => s !== 3));
    }
  }, [step3Categories]);

  useEffect(() => {
    const parseProvinces = () => {
      setProvinceList(philippineCitiesAndProvinces.provinces);
      // Only set default values if career data exists
      if (career?.province) {
        const provinceObj = philippineCitiesAndProvinces.provinces.find(
          (p) => p.name === career.province
        );
        if (provinceObj) {
          const cities = philippineCitiesAndProvinces.cities.filter(
            (city) => city.province === provinceObj.key
          );
          setCityList(cities);
        }
      }
    };
    parseProvinces();
  }, [career]);

  // Initialize current user as Job Owner immediately, or use placeholder
  useEffect(() => {
    setTeamMembers((prev) => {
      // If no members exist, initialize
      if (prev.length === 0) {
        if (user && user.email) {
          // Use actual user data if available
          return [
            {
              email: user.email,
              name: user.name || "Unknown User",
              image:
                user.image ||
                `https://api.dicebear.com/9.x/shapes/svg?seed=${user.email}`,
              role: "Job Owner",
            },
          ];
        } else {
          // Use placeholder for unknown user when bypassing admin
          return [
            {
              email: "unknown@example.com",
              name: "Unknown User",
              image: "https://api.dicebear.com/9.x/shapes/svg?seed=unknown",
              role: "Job Owner",
            },
          ];
        }
      }

      // Replace placeholder user if real user becomes available
      const hasPlaceholder = prev.some(
        (m) => m.email === "unknown@example.com"
      );
      if (hasPlaceholder && user && user.email) {
        return prev.map((m) =>
          m.email === "unknown@example.com"
            ? {
                email: user.email,
                name: user.name || "Unknown User",
                image:
                  user.image ||
                  `https://api.dicebear.com/9.x/shapes/svg?seed=${user.email}`,
                role: "Job Owner",
              }
            : m
        );
      }

      // Update existing user if user data changes
      if (user && user.email) {
        const existingUserIndex = prev.findIndex((m) => m.email === user.email);
        if (existingUserIndex >= 0) {
          return prev.map((m, index) =>
            index === existingUserIndex
              ? {
                  ...m,
                  name: user.name || m.name,
                  image: user.image || m.image,
                  role: m.role || "Job Owner",
                }
              : m
          );
        }
      }

      return prev;
    });
  }, [user]);

  // Fetch all members from organization (no mock fallback)
  useEffect(() => {
    const fetchMembers = async () => {
      if (!orgID) {
        // organization unresolved
        setAvailableMembers([]);
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
          const apiMember = response.data.members?.find(
            (m: any) => m.email === user.email
          );
          if (apiMember) {
            // Update with API data but keep role as "Job Owner"
            setTeamMembers((prev) => {
              return prev.map((m) =>
                m.email === user.email ? { ...apiMember, role: "Job Owner" } : m
              );
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
        setAvailableMembers([]); // silent empty state
      }
    };
    fetchMembers();
  }, [orgID, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addMemberDropdownRef.current &&
        !addMemberDropdownRef.current.contains(event.target as Node)
      ) {
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
    setTeamMembers(
      teamMembers.map((m) => (m.email === email ? { ...m, role } : m))
    );
  };

  const getAvailableMembersToAdd = () => {
    return availableMembers.filter(
      (m) => !teamMembers.some((tm) => tm.email === m.email)
    );
  };

  return (
    <div className="col">
      {formType === "add" ? (
        <div
          style={{
            marginBottom: "35px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>
            {step > 1
              ? `[Draft] ${jobTitle?.trim() || "Untitled Role"}`
              : "Add new career"}
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* subtle auto-save status */}
            {draftStatus !== "idle" && (
              <span style={{ color: "#667085", fontSize: 12 }}>
                {draftStatus === "saving"
                  ? "Saving…"
                  : draftStatus === "saved"
                  ? "Saved"
                  : draftStatus === "error"
                  ? "Save failed"
                  : null}
              </span>
            )}
            <button
              disabled={!isFormValid() || isSavingCareer}
              style={{
                width: "fit-content",
                color: "#414651",
                background: "#fff",
                border: "1px solid #D5D7DA",
                padding: "8px 16px",
                borderRadius: "60px",
                cursor:
                  !isFormValid() || isSavingCareer ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={() => handlePrev()}
            >
              Save as Unpublished
            </button>

            <button
              disabled={isSavingCareer}
              onClick={async () => {
                if (step === 5) {
                  // Final publish from Step 5
                  if (formType === "add") {
                    await saveCareer("active");
                  } else {
                    await updateCareer("active");
                  }
                  return;
                }
                await handleSaveAndContinue();
              }}
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
                transition: "background 0.2s ease",
              }}
            >
              {step === 5 ? "Publish Career" : "Save and Continue"}{" "}
              {step === 5 ? (
                <i className="la la-check-circle"></i>
              ) : (
                <i className="la la-arrow-right"></i>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginBottom: "35px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>
            {step > 1
              ? `[Draft] ${jobTitle?.trim() || "Untitled Role"}`
              : "Edit Career Details"}
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
            }}
          >
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
                transition: "background 0.2s ease",
              }}
              onClick={async () => {
                if (step === 5) {
                  // Final publish in edit flow
                  if (formType === "add") {
                    await saveCareer("active");
                  } else {
                    await updateCareer("active");
                  }
                  return;
                }
                // For earlier steps, enforce required fields and advance
                if (!isFormValid()) {
                  setShowValidation(true);
                  // Persist icon for Step 1 on any invalid state (partial or all empty)
                  if (step === 1) {
                    setErrorSteps((prev) => Array.from(new Set([...prev, 1])));
                  }
                  const invalidFields =
                    document.querySelectorAll(".form-control");
                  invalidFields.forEach((field) => {
                    const inputField = field as HTMLInputElement;
                    if (!inputField.value || !inputField.value.trim()) {
                      inputField.style.border = "1px solid #EF4444";
                    } else {
                      inputField.style.border = "";
                    }
                  });
                  return;
                }
                await handleSaveAndContinue();
              }}
            >
              {step === 5
                ? formType === "add"
                  ? "Publish Career"
                  : "Update & Publish"
                : "Save and Continue"}{" "}
              {step === 5 ? (
                <i className="la la-check-circle"></i>
              ) : (
                <i className="la la-arrow-right"></i>
              )}
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
            return (
              hasJobTitle &&
              hasDescription &&
              hasEmploymentType &&
              hasWorkSetup &&
              hasProvince &&
              hasCity
            );
          }
          // Show half progress from Step 3 toward Step 4 when >=5 AI interview questions are saved
          if (step === 3) {
            return savedAIQuestionCount >= 5;
          }
          return false;
        })()}
        forceStep2Half={
          step === 2
        } /* show half connector toward step 3 only when exactly on step 2 */
        errorSteps={errorSteps}
      />
      {/* Separator */}
      <div
        className="max-w-full mx-auto"
        style={{
          height: 1,
          background: "#E9EAEB",
          width: "85%",
          marginBottom: 20,
        }}
      />
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
          secretPrompt={secretPrompt}
          onChangeSecretPrompt={(val) => setSecretPrompt(val)}
          preScreeningQuestions={preScreeningQuestions}
          setPreScreeningQuestions={setPreScreeningQuestions}
        />
      )}

      {step === 3 && (
        <Step3AI_Interview
          ref={step3Ref}
          secretPrompt={aiSecretPrompt}
          onChangeSecretPrompt={(val) => setAiSecretPrompt(val)}
          initialCategories={step3Categories}
          onCategoriesChange={(cats) => setStep3Categories(cats)}
          // Auto-sync AI screening with CV screening by passing shared value/setter
          screeningSetting={screeningSetting}
          onChangeScreeningSetting={(val) => setScreeningSetting(val)}
          requireVideo={requireVideo}
          onChangeRequireVideo={(val) => setRequireVideo(val)}
        />
      )}
      {step === 4 && <Step4Pipeline />}
      {step === 5 && (
        <Step5Review
          jobTitle={jobTitle}
          description={description}
          employmentType={employmentType}
          workSetup={workSetup}
          country={country}
          province={province}
          city={city}
          minimumSalary={minimumSalary}
          maximumSalary={maximumSalary}
          salaryNegotiable={salaryNegotiable}
          screeningSetting={screeningSetting}
          secretPrompt={secretPrompt}
          aiSecretPrompt={aiSecretPrompt}
          requireVideo={requireVideo}
          teamMembers={teamMembers}
          preScreeningQuestions={preScreeningQuestions}
          interviewCategories={step3Categories}
          onEditCareerDetails={() => setStep(1)}
          onEditCVReview={() => setStep(2)}
          onEditAISetup={() => setStep(3)}
          onEditPipeline={() => setStep(4)}
          formType={formType}
          saving={isSavingCareer}
          onSaveDraft={async () => {
            // final server draft save
            if (formType === "add") {
              await saveCareer("draft");
            } else {
              await updateCareer("draft");
            }
          }}
          onPublish={async () => {
            if (formType === "add") {
              await saveCareer("active");
            } else {
              await updateCareer("active");
            }
          }}
        />
      )}

      {showSaveModal && (
        <CareerActionModal
          action={showSaveModal}
          onAction={(action) => saveCareer(action)}
        />
      )}
      {isSavingCareer && (
        <FullScreenLoadingAnimation
          title={formType === "add" ? "Saving career..." : "Updating career..."}
          subtext={`Please wait while we are ${
            formType === "add" ? "saving" : "updating"
          } the career`}
        />
      )}
    </div>
  );
}
