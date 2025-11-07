"use client";

import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import { errorToast } from "@/lib/Utils";
import { useRef } from "react";

export default function Step1CareerDetails({
  jobTitle,
  setJobTitle,
  description,
  setDescription,
  employmentType,
  setEmploymentType,
  workSetup,
  setWorkSetup,
  country,
  setCountry,
  province,
  setProvince,
  city,
  setCity,
  provinceList,
  cityList,
  setCityList,
  philippineCitiesAndProvinces,
  salaryNegotiable,
  setSalaryNegotiable,
  minimumSalary,
  setMinimumSalary,
  maximumSalary,
  setMaximumSalary,
  showValidation,
  teamMembers,
  availableMembers,
  user,
  roleOptions,
  handleRoleChange,
  handleAddMember,
  handleRemoveMember,
  getAvailableMembersToAdd,
  addMemberDropdownRef,
  showAddMemberDropdown,
  setShowAddMemberDropdown,
}: any) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        gap: 20,
        alignItems: "flex-start",
        marginTop: 16,
        maxWidth: 1500,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* === LEFT COLUMN === */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Career Information */}
            <div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2">
                <h2 className="text-lg font-semibold text-[#181D27] m-3">1. Career Information</h2>
                <div className="layered-card-middle bg-white p-4 mb-2">
                    {/* Basic Info */}
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

                    {/* Employment Type & Work Setup */}
                    <div style={{ marginBottom: 16 }}>
                        <h3 className="font-medium text-[#181D27] mb-2">Work Setting</h3>
                        <div style={{ display: "flex", gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label className="block text-sm text-[#414651] mb-1">Employment Type</label>
                                <CustomDropdown
                                    onSelectSetting={(val) => setEmploymentType(val)}
                                    screeningSetting={employmentType}
                                    settingList={[{ name: "Full-Time" }, { name: "Part-Time" }]}
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
                                    settingList={[{ name: "Fully Remote" }, { name: "Onsite" }, { name: "Hybrid" }]}
                                    placeholder="Choose work arrangement"
                                />
                                {showValidation && !workSetup && (
                                    <span style={{ color: "#EF4444", fontSize: "12px" }}>This is a required field.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Province, City, Country */}
                    <div style={{ marginBottom: 16 }}>
                        <h3 style={{ fontSize: 17, fontWeight: 600, color: "#181D27", marginBottom: 8 }}>Location</h3>
                        <div style={{ display: "flex", gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label className="block text-sm text-[#414651] mb-1">Country</label>
                                <CustomDropdown
                                    onSelectSetting={(val) => setCountry(val)}
                                    screeningSetting={country}
                                    settingList={[{ name: "Philippines" }]}
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label className="block text-sm text-[#414651] mb-1">Province</label>
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
                                    placeholder="Choose province"
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label className="block text-sm text-[#414651] mb-1">City</label>
                                <CustomDropdown
                                    onSelectSetting={(val) => setCity(val)}
                                    screeningSetting={city}
                                    settingList={cityList}
                                    placeholder="Choose city"
                                />
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

            {/* Job Description */}
            <div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2">
                <h2 className="text-lg font-semibold text-[#181D27] m-3">2. Job Description</h2>
                <div className="layered-card-middle bg-white p-4 mb-2">
                    <RichTextEditor setText={setDescription} text={description} />
                    {showValidation && !description && (
                    <span style={{ color: "#EF4444", fontSize: "12px", marginTop: 8, display: "block" }}>
                        This is a required field.
                    </span>
                    )}
                </div>
            </div>

            {/* Team Access */}
            <div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2 mb-5">
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

        {/* === RIGHT COLUMN (Tips) === */}
        <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="layered-card-outer--solid rounded-2xl border border-[#E9EAEB] p-2" style={{ maxWidth: 340 }}>
                <h3 className="text-lg font-semibold text-[#181D27] m-3">💡 Tips</h3>
                <div className="layered-card-middle bg-white p-4 mb-2">
                    <ul style={{ paddingLeft: 0, marginTop: 8, color: "#414651", fontSize: 14, listStyle: "none" }}>
                        <li>
                            <strong>Use clear, standard job titles</strong> for better searchability.
                        </li>
                        <li style={{ marginTop: 8 }}>
                            <strong>Avoid abbreviations</strong> that applicants may not understand.
                        </li>
                        <li style={{ marginTop: 8 }}>
                            <strong>Keep it concise</strong> — job titles should be 2–4 words max.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
}
