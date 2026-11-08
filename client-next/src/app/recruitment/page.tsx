"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { client } from "@/lib/sanityClient";
import Footer from "@/components/Footer/Footer";
import {
  CompetitiveProgramming,
  Projects,
  WebDevelopment,
  Design,
  Management,
  MarketingOutreach,
  SocialMedia,
  Finance,
} from "@/components/Recruitment/questions";

const CornerBrackets = ({ color = "#000000" }: { color?: string }) => (
  <>
    <div style={{ borderColor: color }} className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-[2.5px] border-l-[2.5px] pointer-events-none" />
    <div style={{ borderColor: color }} className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-[2.5px] border-r-[2.5px] pointer-events-none" />
    <div style={{ borderColor: color }} className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-[2.5px] border-l-[2.5px] pointer-events-none" />
    <div style={{ borderColor: color }} className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-[2.5px] border-r-[2.5px] pointer-events-none" />
  </>
);

const DepartmentKeyMap: Record<string, string> = {
  competitive_programming: "Technical (CP)",
  design: "Design",
  finance: "Finance",
  management: "Event Management",
  marketing_and_outreach: "Outreach",
  projects: "Projects",
  social_media_and_content: "Social Media & Content",
  web_development: "Web Development",
};

interface OpenDept {
  value: string;
  title: string;
}

export default function RecruitmentPage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [recruiting, setRecruiting] = useState("No");
  const [openDepartments, setOpenDepartments] = useState<OpenDept[]>([]);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm();

  const [step, setStep] = useState(1);
  const selectedDepartment = watch("department");
  const selectedDepartment2 = watch("department2");
  const registrationNo = watch("reg_no");

  const getDeptFields = (dept: string) => {
    if (dept === "competitive_programming") return ["cpProfile", "linkedin", "whyCp", "cpExperience", "weeklyContests"];
    if (dept === "projects") return ["github", "linkedin", "whyProjects", "hackathon1_select", "hackathon1_contribution", "hackathon1_proposal"];
    if (dept === "web_development") return ["github", "linkedin", "techStack", "webDevCourse"];
    if (dept === "design") return ["designSkills", "whyDesign", "yourWork", "designPortfolio"];
    if (dept === "management") return ["hostelerORdayscholar", "otherClub", "handleSituation", "strength", "effectiveComm"];
    if (dept === "marketing_and_outreach") return ["hostelerORdayscholar", "secureSponsors", "promoteEvent", "moreParticipants"];
    if (dept === "social_media_and_content") return ["pod"];
    if (dept === "finance") return ["whyFinance", "excel"];
    return [];
  };

  const getDepartmentPayload = (formData: any, department: string) => {
    const commonFields = {
      name: formData.name,
      reg_no: formData.reg_no,
      vit_email: formData.vit_email,
      phone_no: formData.phone_no,
      degree: formData.degree,
      branch: formData.branch,
      experience: formData.experience,
      whyJoin: formData.whyJoin,
      department: department,
      cgpa: "10 Pointer",
    };

    let deptFields: Record<string, any> = {};
    if (department === "competitive_programming") {
      deptFields = {
        cpProfile: formData.cpProfile,
        linkedin: formData.linkedin,
        whyCp: formData.whyCp,
        cpExperience: formData.cpExperience,
        weeklyContests: formData.weeklyContests,
      };
    } else if (department === "projects") {
      deptFields = {
        github: formData.github,
        linkedin: formData.linkedin,
        resume: formData.resume,
        whyProjects: formData.whyProjects,
        hackathon1_select: formData.hackathon1_select,
        hackathon1_contribution: formData.hackathon1_contribution,
        hackathon1_proposal: formData.hackathon1_proposal,
        hackathon2_select: formData.hackathon2_select,
        hackathon2_contribution: formData.hackathon2_contribution,
        hackathon2_proposal: formData.hackathon2_proposal,
      };
    } else if (department === "web_development") {
      deptFields = {
        github: formData.github,
        linkedin: formData.linkedin,
        techStack: formData.techStack,
        webDevCourse: formData.webDevCourse,
        whichCourse: formData.whichCourse,
      };
    } else if (department === "design") {
      deptFields = {
        designSkills: formData.designSkills,
        whyDesign: formData.whyDesign,
        yourWork: formData.yourWork,
        designPortfolio: formData.designPortfolio,
      };
    } else if (department === "management") {
      deptFields = {
        hostelerORdayscholar: formData.hostelerORdayscholar,
        otherClub: formData.otherClub,
        roleInCurrentClub: formData.roleInCurrentClub,
        handleSituation: formData.handleSituation,
        strength: formData.strength,
        effectiveComm: formData.effectiveComm,
      };
    } else if (department === "marketing_and_outreach") {
      deptFields = {
        hostelerORdayscholar: formData.hostelerORdayscholar,
        secureSponsors: formData.secureSponsors,
        promoteEvent: formData.promoteEvent,
        moreParticipants: formData.moreParticipants,
      };
    } else if (department === "social_media_and_content") {
      deptFields = {
        pod: formData.pod,
        niche: formData.niche,
        softwareForVideoEditing: formData.softwareForVideoEditing,
      };
    } else if (department === "finance") {
      deptFields = {
        whyFinance: formData.whyFinance,
        excel: formData.excel,
        financialAwareness: formData.financialAwareness,
      };
    }

    return { ...commonFields, ...deptFields };
  };

  const handleNextStep = async () => {
    if (step === 1) {
      const isValid = await trigger([
        "name",
        "reg_no",
        "vit_email",
        "phone_no",
        "degree",
        "branch",
      ]);
      if (isValid) {
        setStep(2);
      }
    } else if (step === 2) {
      const isValid = await trigger([
        "department",
        ...getDeptFields(selectedDepartment),
      ]);
      if (isValid) {
        setStep(3);
      }
    } else if (step === 3) {
      if (!selectedDepartment2 || selectedDepartment2 === "none") {
        setStep(4);
      } else {
        const pref2Fields = getDeptFields(selectedDepartment2).map(f => `pref2_${f}`);
        const isValid = await trigger([
          "department2",
          ...pref2Fields,
        ]);
        if (isValid) {
          setStep(4);
        }
      }
    }
  };

  const pref2Register = (name: string, options: any) => {
    return register(`pref2_${name}`, options);
  };

  const pref2Errors = new Proxy(errors, {
    get(target: any, prop: string | symbol) {
      if (typeof prop === "string") {
        return target[`pref2_${prop}`];
      }
      return target[prop];
    }
  });

  const pref2Watch = (name: string) => {
    return watch ? watch(`pref2_${name}`) : "";
  };

  useEffect(() => {
    if (registrationNo) {
      setValue("reg_no", registrationNo.toUpperCase());
    }
  }, [registrationNo, setValue]);

  // Query Sanity status
  useEffect(() => {
    async function initRecruitment() {
      try {
        const recruitingQuery = `*[_type == "joinus"] | order(_updatedAt desc)[0]{recruiting}`;
        const recruitingData = await client.fetch(recruitingQuery, {}, { useCdn: false });
        setRecruiting(recruitingData?.recruiting || "No");

        const sheetLinksQuery = `*[_type == "recruitmentSheetLinks"] | order(_createdAt desc)[0]{whatsAppGroupLinks}`;
        const linksData = await client.fetch(sheetLinksQuery, {}, { useCdn: false });

        if (linksData?.whatsAppGroupLinks) {
          const keys = Object.keys(linksData.whatsAppGroupLinks);
          const openDepts: OpenDept[] = [];
          for (const key of keys) {
            if (linksData.whatsAppGroupLinks[key]?.needRecruits) {
              openDepts.push({
                value: key,
                title: DepartmentKeyMap[key] || key,
              });
            }
          }
          setOpenDepartments(openDepts);
        }
      } catch (err) {
        console.error("Failed to initialize recruitment page:", err);
      } finally {
        setPageLoading(false);
      }
    }

    initRecruitment();
  }, []);

  const onSubmit = async (formData: any) => {
    setFormSubmitLoading(true);
    setNotification(null);

    try {
      const { reg_no, department, department2 } = formData;
      const hasPref2 = department2 && department2 !== "none" && department2 !== "";

      const readRes = await fetch("/api/recruitment/read");
      if (!readRes.ok) {
        throw new Error("Failed to check duplicate entries. Please try again.");
      }
      const allEntries = await readRes.json();

      const isDuplicate1 = allEntries.find((entry: any) => {
        const deptMatch = entry._sheetDepartment === department || 
                          entry.department === department ||
                          Object.values(entry).some((v: any) => typeof v === 'string' && v === department);
        if (!deptMatch) return false;

        const regNoMatch = Object.keys(entry).some(k => k.trim().toUpperCase() === reg_no.trim().toUpperCase()) ||
                           Object.values(entry).some((v: any) => typeof v === 'string' && v.trim().toUpperCase() === reg_no.trim().toUpperCase());
        return regNoMatch;
      });

      if (isDuplicate1) {
        setNotification({
          type: "warning",
          message: `You have already submitted an application for the first preference department (${DepartmentKeyMap[department] || department})!`,
        });
        setFormSubmitLoading(false);
        return;
      }

      if (hasPref2) {
        const isDuplicate2 = allEntries.find((entry: any) => {
          const deptMatch = entry._sheetDepartment === department2 || 
                            entry.department === department2 ||
                            Object.values(entry).some((v: any) => typeof v === 'string' && v === department2);
          if (!deptMatch) return false;

          const regNoMatch = Object.keys(entry).some(k => k.trim().toUpperCase() === reg_no.trim().toUpperCase()) ||
                             Object.values(entry).some((v: any) => typeof v === 'string' && v.trim().toUpperCase() === reg_no.trim().toUpperCase());
          return regNoMatch;
        });

        if (isDuplicate2) {
          setNotification({
            type: "warning",
            message: `You have already submitted an application for the second preference department (${DepartmentKeyMap[department2] || department2})!`,
          });
          setFormSubmitLoading(false);
          return;
        }
      }

      const payload1 = getDepartmentPayload(formData, department);
      const addRes1 = await fetch("/api/recruitment/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload1 }),
      });

      if (!addRes1.ok) {
        throw new Error(`Failed to submit application for ${DepartmentKeyMap[department] || department}.`);
      }

      const emailRes1 = await fetch("/api/recruitment/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vit_email: formData.vit_email,
          department: department,
          name: formData.name,
        }),
      });

      if (!emailRes1.ok) {
        console.warn(`Failed to send WhatsApp link email for ${department}`);
      }

      if (hasPref2) {
        const pref2FormData: any = { ...formData };
        Object.keys(formData).forEach((key) => {
          if (key.startsWith("pref2_")) {
            const cleanKey = key.replace("pref2_", "");
            pref2FormData[cleanKey] = formData[key];
          }
        });

        const payload2 = getDepartmentPayload(pref2FormData, department2);
        const addRes2 = await fetch("/api/recruitment/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: payload2 }),
        });

        if (!addRes2.ok) {
          throw new Error(`Failed to submit application for second preference (${DepartmentKeyMap[department2] || department2}).`);
        }

        const emailRes2 = await fetch("/api/recruitment/send-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vit_email: formData.vit_email,
            department: department2,
            name: formData.name,
          }),
        });

        if (!emailRes2.ok) {
          console.warn(`Failed to send WhatsApp link email for ${department2}`);
        }
      }

      setNotification({
        type: "success",
        message: hasPref2 
          ? "Applications submitted successfully! Checked your email for BOTH WhatsApp group join links."
          : "Application submitted successfully! Check your email for the WhatsApp group join link.",
      });
      reset();
      setStep(1);
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: "error",
        message: err.message || "An error occurred during submission.",
      });
    } finally {
      setFormSubmitLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#4A6FA5] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#ECE9C7] border-t-transparent rounded-full animate-spin" />
        <p className="font-bebas text-2xl tracking-widest text-[#ECE9C7]">LOADING RECRUITMENT STATUS...</p>
      </div>
    );
  }

  const isRecruitingClosed = recruiting !== "Yes";

  return (
    <div className="min-h-screen bg-[#4A6FA5] text-white flex flex-col relative overflow-x-hidden">
      <div className="flex flex-col items-center justify-center pt-24 pb-8 relative select-none z-10">
        <h1
          className="text-[100px] sm:text-[140px] md:text-[160px] font-normal leading-none tracking-[0.05em] text-white uppercase text-center"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          CODECHEF
        </h1>
        <span
          className="text-[60px] sm:text-[90px] md:text-[110px] font-normal leading-none text-transparent uppercase text-center"
          style={{
            fontFamily: "var(--font-bebas)",
            WebkitTextStroke: "2.5px #FFFFFF",
          }}
        >
          RECRUITMENT
        </span>
      </div>

      {isRecruitingClosed ? (
        <div className="flex-grow flex items-center justify-center px-4 pb-24">
          <div className="relative bg-[#ECE9C7] border-[3px] border-black rounded-[8px] p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center text-black max-w-lg w-full">
            <CornerBrackets color="#000000" />
            <h3
              className="font-bebas text-3xl font-extrabold tracking-wider uppercase mb-3 text-red-600"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              Recruitments are currently closed :(
            </h3>
            <p className="font-sans text-xs sm:text-sm font-semibold text-neutral-800 leading-relaxed">
              We are not accepting applications at the moment. Please follow our social media channels to get updates on future recruitment drives.
            </p>
          </div>
        </div>
      ) : (
        
        <div className="max-w-4xl w-[92%] mx-auto mb-24 z-10">
          <div className="relative bg-[#ECE9C7] border-[3px] border-black rounded-[8px] p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-black">
            <CornerBrackets color="#000000" />

            <h2
              className="text-black text-3xl sm:text-4xl font-normal uppercase leading-tight tracking-wider text-center border-b-2 border-black/10 pb-4"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              Application Form
            </h2>

            <p className="font-sans text-xs font-semibold text-neutral-600 text-center mt-3 mb-6">
              Fill out this form to apply for CodeChef VITC. We will review your application and get in touch with you!
            </p>

            {notification && (
              <div
                className={`mb-6 p-4 border-2 border-black rounded-[8px] shadow-[3px_3px_0px_rgba(0,0,0,1)] font-sans text-xs sm:text-sm font-bold flex flex-col justify-center ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800"
                    : notification.type === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {notification.message}
              </div>
            )}

            <div className="mb-8 px-2 select-none">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-black/25 z-0" />
                
                {[
                  { label: "Profile", stepNum: 1 },
                  { label: "Preference 1", stepNum: 2 },
                  { label: "Preference 2", stepNum: 3 },
                  { label: "Motivation", stepNum: 4 }
                ].map((s) => (
                  <div key={s.stepNum} className="flex flex-col items-center z-10 relative">
                    <div
                      className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-bebas text-lg transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                        step === s.stepNum
                          ? "bg-[#5878AF] text-white scale-110"
                          : step > s.stepNum
                          ? "bg-green-500 text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {step > s.stepNum ? "✓" : s.stepNum}
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-black font-sans uppercase mt-1 bg-[#ECE9C7] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="flex flex-wrap -mx-2">
                
                {step === 1 && (
                  <>
                    <div className="mb-4 w-full md:w-1/2 px-2">
                      <label className="text-sm font-bold text-black flex items-center mt-2 font-sans uppercase tracking-wider">
                        Full Name: <span className="text-red-600 ml-1 text-sm">*</span>
                      </label>
                      <input
                        className="mt-1.5 block w-full px-3 py-2 border-2 border-black rounded-[8px] bg-white text-black font-sans placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        type="text"
                        placeholder="Name eg: Vishal Kumar Yadav"
                        {...register("name", {
                          required: "Name is required",
                          pattern: {
                            value: /^[A-Za-z ]+$/,
                            message: "Invalid name (alphabetic characters and spaces only)",
                          },
                        })}
                      />
                      {errors.name && (
                        <div className="text-red-600 text-xs font-semibold mt-1 font-sans">
                          {errors.name.message as string}
                        </div>
                      )}
                    </div>

                    <div className="mb-4 w-full md:w-1/2 px-2">
                      <label className="text-sm font-bold text-black flex items-center mt-2 font-sans uppercase tracking-wider">
                        Registration No: <span className="text-red-600 ml-1 text-sm">*</span>
                      </label>
                      <input
                        className="mt-1.5 block w-full px-3 py-2 border-2 border-black rounded-[8px] bg-white text-black font-sans placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        type="text"
                        placeholder="Registration No. eg: 21BCE1846"
                        {...register("reg_no", {
                          required: "Registration number is required",
                          pattern: {
                            value: /^(1|2)[0-9](B|M)[A-Z]{2}[0-9]{4}$/,
                            message: "Invalid registration number format (e.g. 21BCE1846)",
                          },
                        })}
                      />
                      {errors.reg_no && (
                        <div className="text-red-600 text-xs font-semibold mt-1 font-sans">
                          {errors.reg_no.message as string}
                        </div>
                      )}
                    </div>

                    <div className="mb-4 w-full px-2">
                      <label className="text-sm font-bold text-black flex items-center mt-2 font-sans uppercase tracking-wider">
                        VIT Student Email: <span className="text-red-600 ml-1 text-sm">*</span>
                      </label>
                      <input
                        className="mt-1.5 block w-full px-3 py-2 border-2 border-black rounded-[8px] bg-white text-black font-sans placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        type="email"
                        placeholder="Email eg: shashank.sharma2022@vitstudent.ac.in"
                        {...register("vit_email", {
                          required: "VIT Email is required",
                          pattern: {
                            value: /^[A-Za-z0-9.]+@(vitstudent|vitchennai)\.ac\.in$/,
                            message: "Invalid VIT Email (must end in @vitstudent.ac.in or @vitchennai.ac.in)",
                          },
                        })}
                      />
                      {errors.vit_email && (
                        <div className="text-red-600 text-xs font-semibold mt-1 font-sans">
                          {errors.vit_email.message as string}
                        </div>
                      )}
                    </div>

                    <div className="mb-4 w-full md:w-1/2 px-2">
                      <label className="text-sm font-bold text-black flex items-center mt-2 font-sans uppercase tracking-wider">
                        Phone No: <span className="text-red-600 ml-1 text-sm">*</span>
                      </label>
                      <input
                        className="mt-1.5 block w-full px-3 py-2 border-2 border-black rounded-[8px] bg-white text-black font-sans placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        type="tel"
                        placeholder="Phone number eg: 8072XXXXXX"
                        {...register("phone_no", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Invalid phone number (must be 10 digits)",
                          },
                        })}
                      />
                      {errors.phone_no && (
                        <div className="text-red-600 text-xs font-semibold mt-1 font-sans">
                          {errors.phone_no.message as string}
                        </div>
                      )}
                    </div>

                    <div className="mb-4 w-full md:w-1/2 px-2">
                      <label className="text-sm font-bold text-black flex items-center mt-2 font-sans uppercase tracking-wider">
                        Degree: <span className="text-red-600 ml-1 text-sm">*</span>
                      </label>
                      <input
                        className="mt-1.5 block w-full px-3 py-2 border-2 border-black rounded-[8px] bg-white text-black font-sans placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        type="text"
                        placeholder="Degree eg: B.Tech, B.Sc, M.Tech"
                        {...register("degree", {
                          required: "Degree is required",
                          pattern: {
                            value: /^[A-Za-z. ]+$/,
                            message: "Invalid degree (only alphabetic characters and dots)",
                          },
                        })}
                      />
                      {errors.degree && (
                        <div className="text-red-600 text-xs font-semibold mt-1 font-sans">
                          {errors.degree.message as string}
                        </div>
                      )}
                    </div>

                    <div className="mb-4 w-full md:w-1/2 px-2">
                      <label className="text-sm font-bold text-black flex items-center mt-2 font-sans uppercase tracking-wider">
                        Branch: <span className="text-red-600 ml-1 text-sm">*</span>
                      </label>
                      <input
                        className="mt-1.5 block w-full px-3 py-2 border-2 border-black rounded-[8px] bg-white text-black font-sans placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        type="text"
                        placeholder="Branch eg: CSE"
                        {...register("branch", {
                          required: "Branch is required",
                          pattern: {
                            value: /^[A-Za-z ]+$/,
                            message: "Invalid branch (alphabetic characters only)",
                          },
                        })}
                      />
                      {errors.branch && (
                        <div className="text-red-600 text-xs font-semibold mt-1 font-sans">
                          {errors.branch.message as string}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="mb-4 w-full px-2">
                      <label className="text-sm font-bold text-black flex items-center mt-2 font-sans uppercase tracking-wider">
                        First Preference Department: <span className="text-red-600 ml-1 text-sm">*</span>
                      </label>
                      <select
                        className="mt-1.5 block w-full px-3 py-2 border-2 border-black rounded-[8px] bg-white text-black font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        {...register("department", { required: "First preference department is required" })}
                      >
                        <option value="">
                          {openDepartments.length === 0
                            ? "No departments recruiting..."
                            : "Select a Department"}
                        </option>
                        {openDepartments.map((dept) => (
                          <option value={dept.value} key={dept.value}>
                            {dept.title}
                          </option>
                        ))}
                      </select>
                      {errors.department && (
                        <div className="text-red-600 text-xs font-semibold mt-1 font-sans">
                          {errors.department.message as string}
                        </div>
                      )}
                    </div>

                    <div className="w-full flex flex-wrap">
                      {selectedDepartment === "competitive_programming" && (
                        <CompetitiveProgramming register={register} errors={errors} />
                      )}
                      {selectedDepartment === "projects" && (
                        <Projects register={register} errors={errors} />
                      )}
                      {selectedDepartment === "web_development" && (
                        <WebDevelopment register={register} errors={errors} watch={watch} />
                      )}
                      {selectedDepartment === "design" && (
                        <Design register={register} errors={errors} />
                      )}
                      {selectedDepartment === "management" && (
                        <Management register={register} errors={errors} watch={watch} />
                      )}
                      {selectedDepartment === "marketing_and_outreach" && (
                        <MarketingOutreach register={register} errors={errors} />
                      )}
                      {selectedDepartment === "social_media_and_content" && (
                        <SocialMedia register={register} errors={errors} watch={watch} />
                      )}
                      {selectedDepartment === "finance" && (
                        <Finance register={register} errors={errors} watch={watch} />
                      )}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="mb-4 w-full px-2">
                      <label className="text-sm font-bold text-black flex items-center mt-2 font-sans uppercase tracking-wider">
                        Second Preference Department: <span className="text-gray-500 font-normal lowercase ml-1">(Optional)</span>
                      </label>
                      <select
                        className="mt-1.5 block w-full px-3 py-2 border-2 border-black rounded-[8px] bg-white text-black font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        {...register("department2")}
                      >
                        <option value="none">No Second Preference (Skip)</option>
                        {openDepartments
                          .filter((dept) => dept.value !== selectedDepartment)
                          .map((dept) => (
                            <option value={dept.value} key={dept.value}>
                              {dept.title}
                            </option>
                          ))}
                      </select>
                    </div>

                    {selectedDepartment2 && selectedDepartment2 !== "none" && selectedDepartment2 !== "" && (
                      <div className="w-full flex flex-wrap">
                        {selectedDepartment2 === "competitive_programming" && (
                          <CompetitiveProgramming register={pref2Register} errors={pref2Errors} />
                        )}
                        {selectedDepartment2 === "projects" && (
                          <Projects register={pref2Register} errors={pref2Errors} />
                        )}
                        {selectedDepartment2 === "web_development" && (
                          <WebDevelopment register={pref2Register} errors={pref2Errors} watch={pref2Watch} />
                        )}
                        {selectedDepartment2 === "design" && (
                          <Design register={pref2Register} errors={pref2Errors} />
                        )}
                        {selectedDepartment2 === "management" && (
                          <Management register={pref2Register} errors={pref2Errors} watch={pref2Watch} />
                        )}
                        {selectedDepartment2 === "marketing_and_outreach" && (
                          <MarketingOutreach register={pref2Register} errors={pref2Errors} />
                        )}
                        {selectedDepartment2 === "social_media_and_content" && (
                          <SocialMedia register={pref2Register} errors={pref2Errors} watch={pref2Watch} />
                        )}
                        {selectedDepartment2 === "finance" && (
                          <Finance register={pref2Register} errors={pref2Errors} watch={pref2Watch} />
                        )}
                      </div>
                    )}
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="mb-4 w-full px-2">
                      <label className="text-sm font-bold text-black flex items-center mt-2 font-sans uppercase tracking-wider">
                        Relevant Experience: <span className="text-red-600 ml-1 text-sm">*</span>
                      </label>
                      <textarea
                        className="mt-1.5 block w-full px-3 py-2 border-2 border-black rounded-[8px] bg-white text-black font-sans placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)] resize-y overflow-x-hidden"
                        placeholder="Describe your previous experience in the department(s) you wish to join, and link to your work if applicable."
                        rows={4}
                        {...register("experience", { required: "Relevant experience details are required" })}
                      />
                      {errors.experience && (
                        <div className="text-red-600 text-xs font-semibold mt-1 font-sans">
                          {errors.experience.message as string}
                        </div>
                      )}
                    </div>

                    <div className="mb-4 w-full px-2">
                      <label className="text-sm font-bold text-black flex items-center mt-2 font-sans uppercase tracking-wider">
                        Why join CodeChef? <span className="text-red-600 ml-1 text-sm">*</span>
                      </label>
                      <textarea
                        className="mt-1.5 block w-full px-3 py-2 border-2 border-black rounded-[8px] bg-white text-black font-sans placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-[3px_3px_0px_rgba(0,0,0,1)] resize-y overflow-x-hidden"
                        placeholder="Tell us why you are interested in joining our club."
                        rows={4}
                        {...register("whyJoin", { required: "This field is required" })}
                      />
                      {errors.whyJoin && (
                        <div className="text-red-600 text-xs font-semibold mt-1 font-sans">
                          {errors.whyJoin.message as string}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 flex justify-between gap-4 px-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="bg-[#ECE9C7] text-black border-2 border-black rounded-lg px-8 py-2.5 font-bebas text-md tracking-widest uppercase transition-all shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-[#d8d5b5] cursor-pointer"
                    style={{ fontFamily: "var(--font-bebas)" }}
                  >
                    Back
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="ml-auto bg-[#5878AF] text-white border-2 border-black rounded-lg px-8 py-2.5 font-bebas text-md tracking-widest uppercase transition-all shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-[#486390] cursor-pointer"
                    style={{ fontFamily: "var(--font-bebas)" }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={formSubmitLoading}
                    className={`ml-auto bg-[#5878AF] text-white border-2 border-black rounded-lg px-8 py-2.5 font-bebas text-md tracking-widest uppercase transition-all shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-[#486390] cursor-pointer flex items-center justify-center gap-2 ${
                      formSubmitLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    style={{ fontFamily: "var(--font-bebas)" }}
                  >
                    {formSubmitLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        SUBMITTING...
                      </>
                    ) : (
                      "SUBMIT APPLICATION"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
