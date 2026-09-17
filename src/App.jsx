import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, FileSignature, 
  AlertTriangle, Building, Calendar, PieChart, Lock, FileText, 
  Download, Trash2, XCircle, Search, ChevronRight, CheckCircle2, 
  Paperclip, Sparkles, Receipt, Heart, FileSpreadsheet, 
  Package, Target, TrendingUp, Info, Euro, ChevronDown, 
  Globe, Mail, Phone, PlusCircle, Edit2, Send, Clock, Hammer, Menu,
  Megaphone, Bell, Newspaper, Camera, MessageCircle,
  Utensils, BarChart3, AlertCircle, Printer, CalendarDays
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, deleteDoc, onSnapshot, addDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as XLSX from 'xlsx';

// Configuration Firebase Officielle
const firebaseConfig = {
  apiKey: "AIzaSyDhKe4Nl3mUHagW1LkG5GT-tI1bB2-wtnE",
  authDomain: "cours-tom-morel.firebaseapp.com",
  projectId: "cours-tom-morel",
  storageBucket: "cours-tom-morel.firebasestorage.app",
  messagingSenderId: "605446922070",
  appId: "1:605446922070:web:7d81aca59101d76c5a00f7",
  measurementId: "G-XL0L5MG9LK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = "cours-tom-morel-erp";

const LOGO_URL = 'https://via.placeholder.com/150/ffffff/000000?text=Logo';

const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
    <p className="text-slate-500">Cette page est en cours de construction. Le module sera bientôt disponible.</p>
  </div>
);

// --- MODULE : PLANNINGS (Cantine & Ménage) ---
const ModulePlannings = ({ defaultTab = 'cantine' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [activePeriod, setActivePeriod] = useState(1);
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState('');
  const [quickFilterFamily, setQuickFilterFamily] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    setActiveTab(defaultTab);
    setQuickFilterFamily(null); 
  }, [defaultTab]);

  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const data = useMemo(() => {
    const famsData = [
      { id: "BOCCA", type: "Ancien", days: [1, 5], isAsso: false },
      { id: "CHOMEL", type: "Nouveau", days: [4], isAsso: false },
      { id: "CORNET-BOUBE", type: "Nouveau", days: [1, 2, 4, 5], isAsso: false },
      { id: "DE LASTIC ST JAL", type: "Nouveau", days: [1, 2, 4, 5], isAsso: false },
      { id: "DE SERRES DE MESPLES", type: "Nouveau", days: [1], isAsso: false },
      { id: "FIARD", type: "Ancien", days: [2, 4], isAsso: false },
      { id: "GREPAT", type: "Ancien", days: [1, 2], isAsso: false },
      { id: "MELLIES", type: "Nouveau", days: [2, 4], isAsso: false },
      { id: "RIOBÉ", type: "Ancien", days: [1, 2, 4, 5], isAsso: false },
      { id: "TAISSIDRE-CARVALHO", type: "Ancien", days: [1], isAsso: false },
      { id: "BEZIAT", type: "Ancien", days: [1, 5], isAsso: true },
      { id: "DE MALAUSSENE", type: "Ancien", days: [1], isAsso: true },
      { id: "FAUVAIN", type: "Ancien", days: [1, 2, 5], isAsso: true }, 
      { id: "LE LÉZEC", type: "Ancien flex", days: [1, 5], flexUntil: "2026-09-18", isAsso: true }
    ];

    const perData = [
      { id: 1, name: "Rentrée - Toussaint", desc: "03/09 - 16/10", start: "2026-09-03", end: "2026-10-16" },
      { id: 2, name: "Toussaint - Noël", desc: "02/11 - 18/12", start: "2026-11-02", end: "2026-12-18" },
      { id: 3, name: "Noël - Février", desc: "04/01 - 12/02", start: "2027-01-04", end: "2027-02-12" },
      { id: 4, name: "Février - Pâques", desc: "01/03 - 09/04", start: "2027-03-01", end: "2027-04-09" },
      { id: 5, name: "Pâques - Été", desc: "26/04 - 02/07", start: "2027-04-26", end: "2027-07-02" }
    ];

    const holiData = ["2026-11-11", "2027-03-26", "2027-03-29", "2027-05-06", "2027-05-07", "2027-05-17"];
    const vacData = [
      { name: "Toussaint", start: "2026-10-17", end: "2026-11-01" },
      { name: "Noël", start: "2026-12-19", end: "2027-01-03" },
      { name: "Hiver", start: "2027-02-13", end: "2027-02-28" },
      { name: "Printemps", start: "2027-04-10", end: "2027-04-25" },
      { name: "d'Été", start: "2027-07-03", end: "2027-08-31" }
    ];

    function getDateStr(d) {
      let year = d.getFullYear(); let month = String(d.getMonth() + 1).padStart(2, '0'); let day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const checkIsOut = (famId, dOw, dStr) => {
      if (!famId || famId.startsWith("Mme")) return false;
      const fam = famsData.find(f => f.id === famId);
      if (!fam) return false;
      if (fam.id === "LE LÉZEC" && fam.flexUntil && dStr <= fam.flexUntil) return false;
      return !fam.days.includes(dOw);
    };

    let scheduleArr = [];
    let menageArr = [];
    let statsObj = {};
    
    famsData.forEach(f => {
      statsObj[f.id] = { cantine: 0, menage: 0, total: 0, lastCantine: null, lastMenage: "2026-01-01" };
    });

    let currentDate = new Date(2026, 8, 3, 12, 0, 0); 
    const endDate = new Date(2027, 6, 3, 12, 0, 0);
    
    let fauvainRiobeThursdays = 0;
    let currentPeriodIdx = 0;
    let periodThursdaysDone = false;
    let regularMenageCount = 0; 

    while (currentDate <= endDate) {
      const dateStr = getDateStr(currentDate);
      const dayOfWeek = currentDate.getDay();
      
      let pIdx = perData.findIndex(p => dateStr >= p.start && dateStr <= p.end);
      if (pIdx !== -1 && pIdx !== currentPeriodIdx) {
        currentPeriodIdx = pIdx;
        periodThursdaysDone = false;
      }
      
      let activeP = perData[0];
      for (let i = 0; i < perData.length; i++) {
        if (dateStr >= perData[i].start && dateStr <= perData[i].end) {
          activeP = perData[i]; break;
        }
      }

      let isVacance = false;
      for (let i = 0; i < vacData.length; i++) {
        if (dateStr >= vacData[i].start && dateStr <= vacData[i].end) { isVacance = true; break; }
      }

      const isSchoolDayFlag = !holiData.includes(dateStr) && !isVacance && [1,2,4,5].includes(dayOfWeek);

      let weekIndex = -1;
      if (dateStr >= "2026-09-07") {
         const d1 = new Date(2026, 8, 7, 12, 0, 0);
         const diffDays = Math.round((currentDate - d1) / (24 * 60 * 60 * 1000));
         weekIndex = Math.floor(diffDays / 7);
      }
      const isGerardSubletWeek = weekIndex >= 0 && weekIndex % 2 === 0;
      const isSubletHervetWeek = weekIndex >= 0 && weekIndex % 2 === 1;

      if (isSchoolDayFlag) {
        let requiredParents = 2; let p1 = null; let p2 = null; let repasType = ""; let forcedError = false;
        const isInt1 = dateStr <= "2026-09-04"; const isInt2 = dateStr > "2026-09-04" && dateStr <= "2026-09-18";

        if (dayOfWeek === 1) { 
          repasType = "Repas par classe"; 
        } 
        else if (dayOfWeek === 2) { 
          repasType = "Placement libre";
          if (isGerardSubletWeek) { requiredParents = 0; p1 = "Mme GERARD"; p2 = "Mme SUBLET"; } 
          else { requiredParents = 2; }
        } 
        else if (dayOfWeek === 4) { 
          repasType = "Filles / Garçons"; 
        } 
        else if (dayOfWeek === 5) { 
          repasType = "Par cordée";
          if (isSubletHervetWeek) { requiredParents = 0; p1 = "Mme SUBLET"; p2 = "Mme HERVET"; } 
          else { requiredParents = 2; }
        }

        let assigned = [];

        if (dateStr === "2026-09-03") {
          assigned = ["BOCCA", "TAISSIDRE-CARVALHO"];
          statsObj["BOCCA"].cantine++; statsObj["BOCCA"].total++; statsObj["BOCCA"].lastCantine = dateStr;
          statsObj["TAISSIDRE-CARVALHO"].cantine++; statsObj["TAISSIDRE-CARVALHO"].total++; statsObj["TAISSIDRE-CARVALHO"].lastCantine = dateStr;
        }
        else if (dateStr === "2026-09-04") {
          assigned = ["RIOBÉ", "BEZIAT"];
          statsObj["RIOBÉ"].cantine++; statsObj["RIOBÉ"].total++; statsObj["RIOBÉ"].lastCantine = dateStr;
          statsObj["BEZIAT"].cantine++; statsObj["BEZIAT"].total++; statsObj["BEZIAT"].lastCantine = dateStr;
        } 
        else if (dayOfWeek === 4 && fauvainRiobeThursdays < 4 && !periodThursdaysDone && currentPeriodIdx < 4) {
          assigned = ["RIOBÉ", "FAUVAIN"];
          fauvainRiobeThursdays++; periodThursdaysDone = true;
          statsObj["RIOBÉ"].cantine++; statsObj["RIOBÉ"].total++; statsObj["RIOBÉ"].lastCantine = dateStr;
          statsObj["FAUVAIN"].cantine++; statsObj["FAUVAIN"].total++; statsObj["FAUVAIN"].lastCantine = dateStr;
        } 
        else if (requiredParents > 0) {
          for (let i = assigned.length; i < requiredParents; i++) {
            let available = famsData.filter(f => {
              if (assigned.includes(f.id)) return false;
              if (f.id === "FAUVAIN" && dayOfWeek === 4) return false; 
              if (f.id === "LE LÉZEC" && dateStr === "2026-10-12") return false; 

              let hasDay = f.days.includes(dayOfWeek);
              if (f.id === "LE LÉZEC" && f.flexUntil && dateStr <= f.flexUntil) hasDay = true;
              if (!hasDay) return false;

              if (f.type === "Nouveau" && statsObj[f.id].lastCantine) {
                let lastD = new Date(statsObj[f.id].lastCantine + "T12:00:00");
                let diffDays = Math.ceil(Math.abs(currentDate - lastD) / (1000 * 60 * 60 * 24));
                if (diffDays <= 3) return false; 
              }

              if (isInt1 && f.type === "Nouveau") return false; 
              if (isInt2) {
                let hasAncien = false;
                if (p1 === "Mme GERARD" || p1 === "Mme SUBLET" || p1 === "Mme HERVET") hasAncien = true;
                for (let a of assigned) {
                  const checkFam = famsData.find(family => family.id === a);
                  if (checkFam && checkFam.type.startsWith("Ancien")) hasAncien = true;
                }
                if (hasAncien && f.type.startsWith("Ancien")) return false; 
                if (!hasAncien && f.type === "Nouveau" && i === 1) return false; 
              }
              return true;
            });

            available.sort((a, b) => {
              let scoreA = statsObj[a.id].total; let scoreB = statsObj[b.id].total;
              if (a.id === "CHOMEL") scoreA += 1;
              if (b.id === "CHOMEL") scoreB += 1;
              
              if (a.id === "FAUVAIN") scoreA += 2;
              if (b.id === "FAUVAIN") scoreB += 2;

              if (scoreA !== scoreB) return scoreA - scoreB;
              if (statsObj[a.id].menage !== statsObj[b.id].menage) return statsObj[a.id].menage - statsObj[b.id].menage; 
              return a.days.length - b.days.length;
            });

            if (available.length > 0) {
              assigned.push(available[0].id);
              statsObj[available[0].id].cantine++; statsObj[available[0].id].total++; statsObj[available[0].id].lastCantine = dateStr;
            } else {
              let fallback = famsData.filter(f => !assigned.includes(f.id)).sort((a, b) => {
                 let scA = statsObj[a.id].total; let scB = statsObj[b.id].total;
                 if (a.id === "FAUVAIN") scA += 2;
                 if (b.id === "FAUVAIN") scB += 2;
                 return scA - scB;
              });
              if (fallback.length > 0) {
                assigned.push(fallback[0].id);
                statsObj[fallback[0].id].cantine++; statsObj[fallback[0].id].total++; statsObj[fallback[0].id].lastCantine = dateStr;
                forcedError = true;
              }
            }
          }
        }

        let finalP1 = null; let finalP2 = null;
        if (requiredParents === 2) { finalP1 = assigned[0]; finalP2 = assigned[1]; }
        else if (requiredParents === 1) { finalP1 = p1; finalP2 = assigned[0]; }
        else if (requiredParents === 0) { finalP1 = p1; finalP2 = p2; }

        let p1Out = checkIsOut(finalP1, dayOfWeek, dateStr);
        let p2Out = checkIsOut(finalP2, dayOfWeek, dateStr);

        scheduleArr.push({ date: dateStr, period: activeP.id, dayOfWeek, p1: finalP1, p2: finalP2, repasType, p1IsOut: p1Out, p2IsOut: p2Out, isError: forcedError });
      }

      if (dayOfWeek === 5 && isSchoolDayFlag) {
        let nextSat = new Date(currentDate); nextSat.setDate(nextSat.getDate() + 1);
        let nextSatStr = getDateStr(nextSat);
        
        let isHolidayStart = false; let holidayName = "";
        for (let i = 0; i < vacData.length; i++) {
          if (nextSatStr === vacData[i].start) { isHolidayStart = true; holidayName = "Vacances " + vacData[i].name; }
        }

        if (isHolidayStart) {
          let eligibleAsso = famsData.filter(f => f.isAsso && statsObj[f.id].menage < 4);
          if (eligibleAsso.length === 0) eligibleAsso = famsData.filter(f => f.isAsso);
          
          eligibleAsso.sort((a, b) => {
            let scA = statsObj[a.id].total; let scB = statsObj[b.id].total;
            if (a.id === "FAUVAIN") scA -= 2;
            if (b.id === "FAUVAIN") scB -= 2;
            return scA - scB || a.id.localeCompare(b.id);
          });
          
          if(eligibleAsso.length > 0) {
            let chosen = eligibleAsso[0].id;
            statsObj[chosen].menage++; statsObj[chosen].total++; statsObj[chosen].lastMenage = dateStr;
            let vacDate = new Date(currentDate); vacDate.setDate(vacDate.getDate() + 1);
            menageArr.push({ date: getDateStr(vacDate), period: activeP.id, familyId: chosen, isVacances: true, label: holidayName });
          }
        } else {
          let candidates = famsData.filter(f => statsObj[f.id].menage === 0);
          
          if (statsObj["CHOMEL"].menage < 4) {
            if (statsObj["CHOMEL"].menage === 0) {
              if (!candidates.some(f => f.id === "CHOMEL")) candidates.push(famsData.find(f => f.id === "CHOMEL"));
            } else {
              let lastChomel = new Date(statsObj["CHOMEL"].lastMenage + "T12:00:00").getTime();
              if (currentDate.getTime() - lastChomel >= 28 * 24 * 60 * 60 * 1000) {
                if (!candidates.some(f => f.id === "CHOMEL")) candidates.push(famsData.find(f => f.id === "CHOMEL"));
              }
            }
          }
          
          if (candidates.length === 0) {
            candidates = famsData.filter(f => {
              if (f.isAsso && f.id !== "FAUVAIN" && statsObj[f.id].menage >= 2) return false; 
              return statsObj[f.id].menage < 4; 
            });
            if(candidates.length === 0) candidates = famsData.filter(f => statsObj[f.id].menage < 4);
            if(candidates.length === 0) candidates = [...famsData]; 
          }

          if (regularMenageCount < 2) {
             let restricted = candidates.filter(f => f.type && f.type.startsWith("Ancien"));
             if (regularMenageCount === 0) {
                 restricted = restricted.filter(f => f.id !== "LE LÉZEC");
             }
             if (restricted.length > 0) {
                 candidates = restricted;
             }
          }
          
          candidates.sort((a, b) => {
            let lastA = new Date(statsObj[a.id].lastMenage + "T12:00:00").getTime(); let lastB = new Date(statsObj[b.id].lastMenage + "T12:00:00").getTime();
            let now = currentDate.getTime();
            let penA = (now - lastA < 28 * 24 * 60 * 60 * 1000) ? 100 : 0; let penB = (now - lastB < 28 * 24 * 60 * 60 * 1000) ? 100 : 0;
            
            let chomelA = (a.id === "CHOMEL" && penA === 0 && statsObj[a.id].menage < 4) ? -100 : 0;
            let chomelB = (b.id === "CHOMEL" && penB === 0 && statsObj[b.id].menage < 4) ? -100 : 0;
            
            let scoreA = statsObj[a.id].total + penA + chomelA;
            let scoreB = statsObj[b.id].total + penB + chomelB;

            if (a.id === "FAUVAIN") scoreA -= 2;
            if (b.id === "FAUVAIN") scoreB -= 2;
            
            if (scoreA !== scoreB) return scoreA - scoreB;
            if (statsObj[a.id].menage !== statsObj[b.id].menage) return statsObj[a.id].menage - statsObj[b.id].menage; 
            return b.days.length - a.days.length; 
          });

          if(candidates.length > 0) {
            let chosen = candidates[0].id;
            statsObj[chosen].menage++; statsObj[chosen].total++; statsObj[chosen].lastMenage = dateStr;
            let nextSat = new Date(currentDate); nextSat.setDate(nextSat.getDate() + 1);
            menageArr.push({ date: getDateStr(nextSat), period: activeP.id, familyId: chosen, isVacances: false, label: "Ménage Hebdomadaire" });
            regularMenageCount++;
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let fStats = Object.keys(statsObj).map(id => {
      return { id: id, name: id, cantine: statsObj[id].cantine, menage: statsObj[id].menage, total: statsObj[id].total, isTeacher: false };
    });
    
    let teaCantine = (tId) => scheduleArr.filter(s => s.p1 === tId || s.p2 === tId).length;
    fStats.push({ id: "Mme GERARD", name: "Mme GERARD", isTeacher: true, cantine: teaCantine("Mme GERARD"), menage: 0, total: teaCantine("Mme GERARD") });
    fStats.push({ id: "Mme SUBLET", name: "Mme SUBLET", isTeacher: true, cantine: teaCantine("Mme SUBLET"), menage: 0, total: teaCantine("Mme SUBLET") });
    fStats.push({ id: "Mme HERVET", name: "Mme HERVET", isTeacher: true, cantine: teaCantine("Mme HERVET"), menage: 0, total: teaCantine("Mme HERVET") });

    fStats.sort((a, b) => {
      if (a.isTeacher && !b.isTeacher) return 1;
      if (!a.isTeacher && b.isTeacher) return -1;
      if (b.total !== a.total) return b.total - a.total;
      return String(a.id).localeCompare(String(b.id));
    });

    return { familiesList: famsData, periodsInfo: perData, schedule: scheduleArr, menagesSchedule: menageArr, familyStats: fStats, holidays: holiData };
  }, []);

  const { familiesList, periodsInfo, schedule, menagesSchedule, familyStats, holidays } = data;

  const getLocalDateString = (d) => {
    let year = d.getFullYear(); let month = String(d.getMonth() + 1).padStart(2, '0'); let day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    let str = new Date(dateString + "T12:00:00").toLocaleDateString('fr-FR', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatMenageDate = (dateString) => {
    if (!dateString) return "";
    let d1 = new Date(dateString + "T12:00:00"); let d2 = new Date(dateString + "T12:00:00");
    d1.setDate(d1.getDate() + 1); d2.setDate(d2.getDate() + 2); 
    return `Sam. ${d1.getDate()} au Dim. ${new Date(d2).toLocaleDateString('fr-FR', {day:'numeric', month:'short'})}`;
  };

  const teacherStyles = {
    "Mme GERARD": "bg-slate-800 text-white border-slate-900",
    "Mme SUBLET": "bg-neutral-800 text-white border-neutral-900",
    "Mme HERVET": "bg-zinc-800 text-white border-zinc-900"
  };

  const familyStyles = {
    "TAISSIDRE-CARVALHO": "bg-cyan-100 text-cyan-800 border-cyan-300",
    "DE MALAUSSENE": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
    "DE SERRES DE MESPLES": "bg-yellow-200 text-yellow-900 border-yellow-400",
    "DE SERRES": "bg-yellow-200 text-yellow-900 border-yellow-400",
    "LE LÉZEC": "bg-sky-100 text-sky-800 border-sky-300",
    "FIARD": "bg-pink-100 text-pink-800 border-pink-300",
    "GREPAT": "bg-indigo-100 text-indigo-800 border-indigo-300",
    "MELLIES": "bg-teal-100 text-teal-800 border-teal-300",
    "BOCCA": "bg-blue-100 text-blue-800 border-blue-300",
    "BEZIAT": "bg-emerald-100 text-emerald-800 border-emerald-300",
    "DE LASTIC ST JAL": "bg-purple-100 text-purple-800 border-purple-300",
    "CHOMEL": "bg-red-100 text-red-800 border-red-300",
    "CORNET-BOUBE": "bg-lime-100 text-lime-800 border-lime-300",
    "RIOBÉ": "bg-orange-100 text-orange-800 border-orange-300",
    "FAUVAIN": "bg-amber-100 text-amber-800 border-amber-300"
  };

  const FamilyPill = ({ id, isOut = false, fullWidth = false }) => {
    if (!id || typeof id !== 'string') return <span className={`text-red-500 text-xs italic bg-red-50 px-2 py-0.5 rounded border border-red-300 ${fullWidth ? 'w-full text-center block' : ''}`}>-</span>;
    
    let isTeacher = id.startsWith("Mme");
    let styleClass = isTeacher ? (teacherStyles[id] || "bg-slate-700 text-white") : (familyStyles[id] || "bg-slate-100 text-slate-800 border-slate-300");
    let errBorder = isOut ? "border-red-600 shadow-red-200 border-2" : "border-transparent";
    
    const widthClass = fullWidth ? "w-full justify-center" : "";
    const textClass = fullWidth ? "text-[10px] leading-tight truncate" : "text-[11px]";

    return (
      <button 
        onClick={() => setQuickFilterFamily(id)}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border font-extrabold shadow-sm transition-all hover:opacity-80 active:scale-95 cursor-pointer ${styleClass} ${errBorder} ${widthClass} ${textClass}`}
        title={isOut ? `⚠️ Jour non souhaité par ${id}` : `Filtrer sur ${id}`}
      >
        {isTeacher && <Users size={10} className="shrink-0" />} 
        {isOut && <AlertTriangle size={10} className="text-red-600 shrink-0" />} 
        <span className="truncate">{id}</span>
      </button>
    );
  };

  const displayedCantine = schedule.filter(s => 
    s.period === activePeriod && 
    (!quickFilterFamily || s.p1 === quickFilterFamily || s.p2 === quickFilterFamily) &&
    (showHistory || s.date >= todayStr)
  );
  
  const displayedMenage = menagesSchedule.filter(m => 
    m.period === activePeriod && 
    (!quickFilterFamily || m.familyId === quickFilterFamily) &&
    (showHistory || m.date >= todayStr)
  );

  const handleExportCSV = () => {
    let exportData = []; const headers = [];

    if (activeTab === 'cantine') {
      headers.push('Période', 'Date', 'Procédure', 'Intervenant 1', 'Intervenant 2');
      schedule.forEach(r => {
        if (!quickFilterFamily || r.p1 === quickFilterFamily || r.p2 === quickFilterFamily) {
           let periodObj = periodsInfo.find(p => p.id === r.period);
           let pName = periodObj ? periodObj.name : 'Inconnu';
           exportData.push([pName, r.date, r.repasType, r.p1, r.p2]);
        }
      });
    } else if (activeTab === 'menage') {
      headers.push('Période', 'Date', 'Famille', 'Type');
      menagesSchedule.forEach(r => {
        if (!quickFilterFamily || r.familyId === quickFilterFamily) {
           let periodObj = periodsInfo.find(p => p.id === r.period);
           let pName = periodObj ? periodObj.name : 'Inconnu';
           exportData.push([pName, r.date, r.familyId, r.label]);
        }
      });
    } else if (activeTab === 'stats') {
      headers.push('Famille / Intervenant', 'Tours de Cantine', 'Tours de Ménage', 'Total Services');
      familyStats.forEach(s => exportData.push([s.name, s.cantine, s.menage, s.total]));
    } else if (activeTab === 'famille') {
      if (!selectedFamilyFilter) return alert("Sélectionnez un nom.");
      headers.push('Type', 'Période', 'Date', 'Détails');
      schedule.filter(s => s.p1 === selectedFamilyFilter || s.p2 === selectedFamilyFilter).forEach(r => {
         const partner = r.p1 === selectedFamilyFilter ? r.p2 : r.p1;
         let periodObj = periodsInfo.find(p => p.id === r.period);
         let pName = periodObj ? periodObj.name : 'Inconnu';
         exportData.push(['Cantine', pName, r.date, `Binôme avec : ${partner || 'Aucun'}`]);
      });
      menagesSchedule.filter(m => m.familyId === selectedFamilyFilter).forEach(r => {
         let periodObj = periodsInfo.find(p => p.id === r.period);
         let pName = periodObj ? periodObj.name : 'Inconnu';
         exportData.push(['Ménage', pName, r.date, r.label]);
      });
    } else { return; }

    if (exportData.length === 0) return alert("Aucune donnée à exporter.");
    const csvContent = "\uFEFF" + [headers.join(';'), ...exportData.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = 'export_planning.csv'; 
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleDownloadImage = () => {
    setIsCapturing(true);
    const element = document.getElementById('capture-zone');
    if (!element) {
      setIsCapturing(false);
      return;
    }

    const doCapture = () => {
      const originalWidth = element.style.width;
      const originalOverflow = element.style.overflow;
      element.style.width = '1250px'; 
      element.style.overflow = 'visible';

      window.html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#f8fafc', 
        logging: false 
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Calendrier_Scolaire_2026_2027.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        element.style.width = originalWidth;
        element.style.overflow = originalOverflow;
        setIsCapturing(false);
      }).catch(err => {
        console.error(err);
        alert("Une erreur est survenue lors de la capture.");
        element.style.width = originalWidth;
        element.style.overflow = originalOverflow;
        setIsCapturing(false);
      });
    };

    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = doCapture;
      document.body.appendChild(script);
    } else {
      doCapture();
    }
  };

  const renderCalendarGrid = () => {
    const months = [
      { y: 2026, m: 8, name: 'Septembre' }, { y: 2026, m: 9, name: 'Octobre' }, { y: 2026, m: 10, name: 'Novembre' },
      { y: 2026, m: 11, name: 'Décembre' }, { y: 2027, m: 0, name: 'Janvier' }, { y: 2027, m: 1, name: 'Février' },
      { y: 2027, m: 2, name: 'Mars' }, { y: 2027, m: 3, name: 'Avril' }, { y: 2027, m: 4, name: 'Mai' },
      { y: 2027, m: 5, name: 'Juin' }, { y: 2027, m: 6, name: 'Juillet' }
    ];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    const cells = [];

    cells.push(<div key="tl" className="bg-slate-100 border-r border-b-2 border-slate-300 sticky top-0 z-20" style={{ gridColumn: 1, gridRow: 1 }}></div>);

    months.forEach((mo, idx) => {
      cells.push(
        <div key={`header-${idx}`} className="bg-slate-100 font-bold text-center p-2 border-r border-b-2 border-slate-300 sticky top-0 z-10 print:text-[10px] print:p-1" style={{ gridColumn: idx + 2, gridRow: 1 }}>
          {mo.name}
        </div>
      );
    });

    for (let day = 1; day <= 31; day++) {
      cells.push(
        <div key={`day-${day}`} className="bg-slate-50 font-bold text-slate-500 border-r border-b border-slate-200 flex items-center justify-center text-xs sticky left-0 z-10 print:text-[8px]" style={{ gridColumn: 1, gridRow: day + 1 }}>
          {day}
        </div>
      );
    }

    months.forEach((mo, moIdx) => {
      const daysInMonth = new Date(mo.y, mo.m + 1, 0).getDate();
      
      for (let day = 1; day <= 31; day++) {
        if (day > daysInMonth) {
          cells.push(<div key={`empty-${mo.m}-${day}`} className="bg-slate-50/50 border-r border-b border-slate-200" style={{ gridColumn: moIdx + 2, gridRow: day + 1 }}></div>);
          continue;
        }

        let d = new Date(mo.y, mo.m, day, 12, 0, 0);
        const dateStr = getLocalDateString(d);
        const dayWeek = d.getDay();
        const isWeekend = dayWeek === 0 || dayWeek === 6;
        const isHoliday = holidays.includes(dateStr);

        let cantineEvent = schedule.find(s => s.date === dateStr);
        let menageEvent = menagesSchedule.find(m => m.date === dateStr);

        if (!menageEvent && dayWeek === 0) {
           let satDate = new Date(d);
           satDate.setDate(satDate.getDate() - 1);
           menageEvent = menagesSchedule.find(m => m.date === getLocalDateString(satDate));
        }

        if (dayWeek === 0 && day > 1 && menageEvent) {
           continue;
        }

        let rowSpan = 1;
        if (menageEvent && dayWeek === 6 && day < daysInMonth) {
           rowSpan = 2;
        }

        let customStyle = { gridColumn: moIdx + 2, gridRow: `${day + 1} / span ${rowSpan}` };
        let cellClass = "p-1 flex flex-col gap-0.5 border-r border-b border-slate-200 text-[9px] min-h-[40px] relative overflow-hidden bg-white ";

        if (!cantineEvent && !menageEvent && !isHoliday && !isWeekend) {
           customStyle.backgroundImage = 'repeating-linear-gradient(45deg, #ffffff, #ffffff 6px, #f1f5f9 6px, #f1f5f9 12px)';
        } else if (isHoliday) {
           cellClass += "bg-slate-100 opacity-60 ";
        } else if (isWeekend && !menageEvent) {
           cellClass += "bg-slate-50 ";
        }

        if (menageEvent && rowSpan === 2) {
           cellClass += "bg-indigo-50/20 ";
        }

        let dayLabel = dayNames[dayWeek];
        if (rowSpan === 2) {
           dayLabel = `Sam ${day} - Dim ${day+1}`;
        }

        cells.push(
          <div key={`${mo.m}-${day}`} className={cellClass} style={customStyle}>
            <div className="font-bold text-slate-400 mb-0.5 text-center bg-white/60 rounded px-1 w-fit mx-auto print:text-[8px]">{dayLabel}</div>
            
            {cantineEvent && (
              <div className="flex flex-col gap-0.5 items-center w-full relative z-10">
                {cantineEvent.p1 && <FamilyPill id={cantineEvent.p1} isOut={cantineEvent.p1IsOut} fullWidth={true} />}
                {cantineEvent.p2 && <FamilyPill id={cantineEvent.p2} isOut={cantineEvent.p2IsOut} fullWidth={true} />}
              </div>
            )}

            {menageEvent && (
              <div className={`mt-auto pt-0.5 flex flex-col gap-0.5 items-center w-full relative z-10 ${rowSpan === 2 ? 'mb-auto' : ''}`}>
                <span className="text-[9px] text-indigo-700 uppercase font-black flex items-center justify-center bg-indigo-100 border border-indigo-200 w-full py-0.5 rounded shadow-sm print:text-[8px]">
                   🧹 MÉNAGE
                </span>
                <FamilyPill id={menageEvent.familyId} isOut={false} fullWidth={true} />
              </div>
            )}
          </div>
        );
      }
    });

    return (
      <div className="overflow-x-auto pb-10 calendar-container print:overflow-visible print:pb-0 print:w-full print:max-w-none">
        <div id="capture-zone" className="grid border-t border-l border-slate-200 min-w-[1200px] calendar-grid print:min-w-0 print:w-full print:h-[95vh] bg-white rounded-lg p-2" style={{ gridTemplateColumns: "25px repeat(11, minmax(0, 1fr))", gridTemplateRows: "auto repeat(31, minmax(0, 1fr))" }}>
          {cells}
        </div>
      </div>
    );
  };

  const renderFamilyTab = () => {
    if (!selectedFamilyFilter) {
      return (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center bg-white rounded-2xl border border-slate-200 print:hidden">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200"><Search size={32} className="text-slate-300" /></div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Recherche Individuelle</h3>
          <p>Sélectionnez un nom ci-dessus pour afficher son calendrier personnel.</p>
        </div>
      );
    }

    const isTeacher = selectedFamilyFilter.startsWith("Mme");
    const famInfo = isTeacher ? { type: "Équipe Pédagogique", isAsso: false } : familiesList.find(f => f.id === selectedFamilyFilter);
    let allEvents = [
        ...schedule.filter(s => s.p1 === selectedFamilyFilter || s.p2 === selectedFamilyFilter).map(s => ({ 
          date: s.date, type: 'Cantine', details: s.repasType, period: s.period, 
          isOut: (s.p1 === selectedFamilyFilter && s.p1IsOut) || (s.p2 === selectedFamilyFilter && s.p2IsOut) 
        })),
        ...menagesSchedule.filter(m => m.familyId === selectedFamilyFilter).map(m => ({ date: m.date, type: 'Ménage', details: m.label, isVacances: m.isVacances, period: m.period }))
    ].sort((a, b) => new Date(a.date+"T12:00:00") - new Date(b.date+"T12:00:00"));

    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="text-xl"><FamilyPill id={selectedFamilyFilter} /></div>
              <div>
                <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">{famInfo ? famInfo.type : ''} {famInfo && famInfo.isAsso ? '• Membre Asso' : ''}</div>
                <div className="text-slate-800 font-bold mt-1">Total : {allEvents.length} services</div>
              </div>
            </div>
        </div>
        <div className="p-0">
          {allEvents.length === 0 ? <div className="p-8 text-center text-slate-500">Aucun service planifié.</div> : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <tr><th className="p-4 border-b border-slate-200">Date</th><th className="p-4 border-b border-slate-200">Type de service</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  let currentP = 0;
                  return allEvents.map((e, idx) => {
                    let pHeader = null;
                    if (e.period !== currentP) {
                      currentP = e.period;
                      let periodObj = periodsInfo.find(p=>p.id===currentP);
                      let pName = periodObj ? periodObj.name : 'Période inconnue';
                      pHeader = <tr key={`ph-${idx}`}><td colSpan="2" className="bg-slate-100 px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{pName}</td></tr>;
                    }
                    const isCantine = e.type === 'Cantine';
                    const iconClass = isCantine ? 'text-blue-500 bg-blue-100' : (e.isVacances ? 'text-amber-500 bg-amber-100' : 'text-indigo-500 bg-indigo-100');
                    const dateDisplay = (e.type === 'Ménage' && !e.isVacances) ? formatMenageDate(e.date) : formatDate(e.date);

                    return (
                      <React.Fragment key={`frag-${idx}`}>
                        {pHeader}
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-semibold text-slate-700 whitespace-nowrap capitalize">{dateDisplay}</td>
                          <td className="p-4">
                              <div className="flex flex-wrap items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconClass}`}>
                                    {isCantine ? <Utensils size={14} /> : (e.isVacances ? <CalendarDays size={14} /> : <Sparkles size={14} />)}
                                  </div>
                                  <div><strong className="text-slate-800 block">{e.type}</strong><span className="text-slate-500 text-xs">{e.details}</span></div>
                                  {e.isOut && !isTeacher && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase tracking-wider border border-red-300 shadow-sm"><AlertTriangle size={10}/> Dépannage (Hors dispo)</span>}
                              </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  });
                })()}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-transparent font-sans text-slate-800 animate-fade-in relative pb-10">
      <style>{`
        @media print {
          @page { size: landscape; margin: 3mm; }
          
          html, body, #root, main, .overflow-y-auto, .h-screen, .overflow-hidden, .custom-scrollbar { 
             height: auto !important; 
             max-height: none !important;
             overflow: visible !important; 
             position: static !important;
          }
          
          aside, header, #main-nav, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          body { background: white !important; }
          
          .print-cards-container {
             display: grid !important;
             grid-template-columns: repeat(3, 1fr) !important;
             gap: 10px !important;
             width: 100% !important;
          }
          .print-cards-container > div {
             page-break-inside: avoid !important;
             break-inside: avoid !important;
             border: 1pt solid #cbd5e1 !important;
             box-shadow: none !important;
          }

          .calendar-container { 
             overflow: visible !important; 
             width: 100% !important;
          }
          .calendar-grid { 
             min-width: 100% !important; 
             width: 100% !important; 
             height: 95vh !important;
             grid-template-columns: 20px repeat(11, minmax(0, 1fr)) !important; 
             grid-template-rows: auto repeat(31, minmax(0, 1fr)) !important; 
          }
          .calendar-grid > div { 
             padding: 1px !important; 
             min-height: 0 !important; 
             page-break-inside: avoid !important;
          }
          .calendar-grid * { line-height: 1 !important; }
          .calendar-grid button { padding: 1px !important; border-width: 0.5px !important; }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <CalendarDays size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">Planning Scolaire 2026-2027 <span className="text-blue-600">(Zone A)</span></h1>
              <p className="text-slate-500 text-sm font-medium">Tableau de bord de gestion Cantine & Ménage</p>
            </div>
          </div>
          <div className="flex gap-3">
            {activeTab !== 'regles' && activeTab !== 'calendrier' && (
              <button onClick={handleExportCSV} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2">
                <Download size={16} /> Exporter (CSV)
              </button>
            )}
            
            <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm flex items-center gap-2">
              <Printer size={16} /> Imprimer
            </button>

            {activeTab === 'calendrier' && (
              <button 
                onClick={handleDownloadImage} 
                disabled={isCapturing}
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm flex items-center gap-2 ${isCapturing ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
              >
                {isCapturing ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span> : <Camera size={16} />}
                {isCapturing ? 'Génération...' : 'Image (PNG)'}
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-wrap justify-center gap-2 mb-8 print:hidden" id="main-nav">
          <button onClick={() => setActiveTab('cantine')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === 'cantine' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><Utensils size={16} /> Cantine</button>
          <button onClick={() => setActiveTab('menage')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === 'menage' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><Sparkles size={16} /> Ménage</button>
          <button onClick={() => setActiveTab('calendrier')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === 'calendrier' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><CalendarDays size={16} /> Calendrier</button>
          <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === 'stats' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><BarChart3 size={16} /> Statistiques</button>
          <button onClick={() => setActiveTab('famille')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === 'famille' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><Search size={16} /> Par Famille</button>
          <button onClick={() => setActiveTab('regles')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${activeTab === 'regles' ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}><Info size={16} /> Règles</button>
        </div>

        {quickFilterFamily && (activeTab === 'cantine' || activeTab === 'menage') && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-6 py-3 mb-4 rounded-xl flex justify-between items-center shadow-sm print:hidden animate-fade-in max-w-4xl mx-auto">
            <span className="font-bold text-sm flex items-center gap-2">
              <Search size={16} className="text-indigo-600"/> Filtre actif : <span className="uppercase text-indigo-600">{quickFilterFamily}</span>
            </span>
            <button onClick={() => setQuickFilterFamily(null)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition-colors shadow-sm">
              <XCircle size={14} /> Annuler le filtre
            </button>
          </div>
        )}

        <div className="bg-transparent border-none">
          
          {activeTab === 'cantine' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8 text-center print:text-left">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3 mb-4">
                  <Utensils className="text-blue-500" /> Planning de la Cantine
                </h2>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 print:hidden">
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 bg-slate-100 p-2 rounded-xl w-full md:w-auto shadow-inner">
                    {periodsInfo.map(p => (
                      <button key={p.id} onClick={() => setActivePeriod(p.id)} className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex-1 ${activePeriod === p.id ? 'bg-white shadow-sm text-blue-600 border-blue-200' : 'text-slate-500 border-transparent hover:bg-slate-200'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowHistory(!showHistory)} 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm"
                  >
                    <Clock size={16} /> {showHistory ? "Masquer le passé" : "Afficher l'historique"}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print-cards-container">
                {displayedCantine.map((row, i) => {
                  let dayBg = "bg-white"; let dayBorder = "border-slate-200";
                  if (row.dayOfWeek === 1) { dayBg = "bg-blue-50/50"; dayBorder = "border-blue-100"; }
                  if (row.dayOfWeek === 2) { dayBg = "bg-purple-50/50"; dayBorder = "border-purple-100"; }
                  if (row.dayOfWeek === 4) { dayBg = "bg-orange-50/50"; dayBorder = "border-orange-100"; }
                  if (row.dayOfWeek === 5) { dayBg = "bg-teal-50/50"; dayBorder = "border-teal-100"; }

                  return (
                    <div key={i} className={`${dayBg} rounded-xl p-4 border ${dayBorder} shadow-sm relative hover:shadow-md transition-shadow flex flex-col`}>
                      <div className="text-sm font-bold text-slate-700 mb-1 border-b border-slate-200/50 pb-2 capitalize">
                        {formatDate(row.date)}
                      </div>
                      <div className="mt-2 mb-3">
                        <span className="bg-white/80 text-slate-600 px-2 py-1 rounded border border-slate-100 text-xs font-semibold shadow-sm inline-block">
                          {row.repasType}
                        </span>
                      </div>
                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Famille</span>
                          <FamilyPill id={row.p1} isOut={row.p1IsOut} />
                        </div>
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Famille</span>
                          <FamilyPill id={row.p2} isOut={row.p2IsOut} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {displayedCantine.length === 0 && (
                <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  Aucun jour de cantine trouvé pour cette sélection.
                </div>
              )}
            </div>
          )}

          {/* TAB MENAGE */}
          {activeTab === 'menage' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8 text-center print:text-left">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3 mb-4">
                  <Sparkles className="text-indigo-500" /> Planning du Ménage
                </h2>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 print:hidden">
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 bg-slate-100 p-2 rounded-xl w-full md:w-auto shadow-inner">
                    {periodsInfo.map(p => (
                      <button key={p.id} onClick={() => setActivePeriod(p.id)} className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex-1 ${activePeriod === p.id ? 'bg-white shadow-sm text-indigo-600 border-indigo-200' : 'text-slate-500 border-transparent hover:bg-slate-200'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowHistory(!showHistory)} 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm"
                  >
                    <Clock size={16} /> {showHistory ? "Masquer le passé" : "Afficher l'historique"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print-cards-container">
                {displayedMenage.map((row, i) => {
                  let isVac = row.isVacances;
                  let bgCard = isVac ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-white border-slate-200';
                  
                  return (
                    <div key={i} className={`${bgCard} rounded-xl p-5 border shadow-sm relative overflow-hidden flex flex-col h-full hover:shadow-md transition-all`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className={`text-xs font-bold ${isVac ? 'text-amber-500' : 'text-slate-400'} uppercase tracking-wider mb-1 flex items-center gap-2`}>
                            <CalendarDays size={14} className={isVac ? 'text-amber-500' : 'text-emerald-500'}/> {row.label}
                          </div>
                          <div className={`text-sm font-bold ${isVac ? 'text-amber-800' : 'text-slate-700'} capitalize mt-2 bg-white/50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block`}>
                            {isVac ? formatDate(row.date) : formatMenageDate(row.date)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto bg-white/60 p-3 rounded-lg border border-slate-100/50 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Resp.</span>
                        <div className="flex items-center gap-2">
                          <FamilyPill id={row.familyId} />
                          {isVac && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 uppercase">Asso</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {displayedMenage.length === 0 && (
                <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  Aucun ménage assigné pour cette sélection.
                </div>
              )}
            </div>
          )}

          {/* TAB CALENDRIER */}
          {activeTab === 'calendrier' && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-6 print:text-left">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2"><CalendarDays className="text-blue-500" /> Calendrier Annuel Global</h2>
              </div>
              {renderCalendarGrid()}
            </div>
          )}

          {/* TAB STATS */}
          {activeTab === 'stats' && (
            <div className="animate-in fade-in duration-300 max-w-4xl mx-auto pb-12">
              <div className="text-center mb-8 print:text-left">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2"><BarChart3 className="text-blue-500" /> Bilan d'Équité</h2>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr><th className="p-4 font-bold">Famille</th><th className="p-4 font-bold text-center">Cantine</th><th className="p-4 font-bold text-center">Ménage</th><th className="p-4 font-bold text-center">Total Services</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {familyStats.map((stat, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-semibold text-slate-800"><FamilyPill id={stat.id} /></td>
                        <td className="p-4 text-center text-blue-600 font-bold">{stat.cantine}</td><td className="p-4 text-center text-indigo-600 font-bold">{stat.menage}</td>
                        <td className="p-4 text-center"><span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold border border-slate-200">{stat.total}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB FAMILLE */}
          {activeTab === 'famille' && (
            <div className="animate-in fade-in duration-300 max-w-3xl mx-auto pb-12">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col items-center print:hidden">
                <label className="font-bold text-slate-700 mb-3 text-lg">Rechercher le planning d'une famille ou maîtresse :</label>
                <div className="relative w-full max-w-md">
                  <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select 
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 pr-4 py-3 font-semibold shadow-inner outline-none"
                    value={selectedFamilyFilter} onChange={(e) => setSelectedFamilyFilter(e.target.value)}
                  >
                    <option value="">Sélectionnez un nom...</option>
                    <optgroup label="Familles">{familiesList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</optgroup>
                    <optgroup label="Maîtresses"><option value="Mme GERARD">Mme GERARD</option><option value="Mme SUBLET">Mme SUBLET</option><option value="Mme HERVET">Mme HERVET</option></optgroup>
                  </select>
                </div>
              </div>
              
              {renderFamilyTab()}
            </div>
          )}

          {/* TAB RÈGLES */}
          {activeTab === 'regles' && (
            <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6"><Info className="text-blue-500" /> Règles de l'Algorithme</h2>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2 flex items-center gap-2"><Utensils className="text-slate-400" size={18}/> Jours de Cantine</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                      <li><strong>Lundi :</strong> Repas par classe (2 parents)</li>
                      <li><strong>Mardi :</strong> Alternance. Semaine 1 : Mme Gerard + Mme Sublet (0 parent). Semaine 2 : 2 parents.</li>
                      <li><strong>Jeudi :</strong> Filles/Garçons (2 parents)</li>
                      <li><strong>Vendredi :</strong> Par cordée. Alternance. Semaine 1 : 2 parents. Semaine 2 : Mme Sublet + Mme Hervet (0 parent).</li>
                  </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2 flex items-center gap-2"><Users className="text-slate-400" size={18}/> Période d'intégration</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                      <li><strong>Du 03 au 04 Sept. :</strong> Uniquement des anciens.</li><li><strong>Du 07 au 18 Sept. :</strong> Binômes obligatoires (1 Ancien + 1 Nouveau). Les maîtresses comptent comme "Ancien".</li>
                  </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2 flex items-center gap-2"><AlertCircle className="text-slate-400" size={18}/> Cas Particuliers Strictes</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                      <li><strong>Nouveaux :</strong> Ne sont jamais placés 2 jours d'affilée.</li>
                      <li><strong>Échange Septembre :</strong> BOCCA + TAISSIDRE-CARVALHO le 3 sept. RIOBÉ + BEZIAT le 4 sept.</li>
                      <li><strong>FAUVAIN :</strong> Fait 4 jeudis en duo avec RIOBÉ (1 par période). Leurs 2 cantines de base sont converties en 2 ménages supplémentaires pour équilibrer.</li>
                      <li><strong className="text-rose-600 inline-flex items-center gap-1"><AlertTriangle size={14}/> Icône d'alerte :</strong> Indique qu'une famille dépanne sur un jour qu'elle n'avait pas indiqué dans ses disponibilités.</li>
                  </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2 flex items-center gap-2"><Sparkles className="text-slate-400" size={18}/> Ménage et Équité</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                      <li>Un ménage est planifié chaque week-end de période scolaire.</li>
                      <li><strong>Règle Rentrée :</strong> Les 2 premiers week-ends sont exclusivement réalisés par des "Anciens" (Le Lézec exclu du tout premier).</li>
                      <li>Les 5 ménages des vacances sont réservés aux membres de l'association.</li>
                  </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
