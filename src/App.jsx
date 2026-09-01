import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, FileSignature, 
  AlertTriangle, Building, Calendar, PieChart, Lock, FileText, 
  Download, Trash2, XCircle, Search, ChevronRight, CheckCircle2, 
  Paperclip, Plus, Sparkles, Receipt, Heart, FileSpreadsheet, 
  Package, Target, TrendingUp, Info, Euro, ChevronDown, 
  Globe, Mail, Phone, PlusCircle, Edit2, Send, Clock, Hammer, Menu,
  Megaphone, Bell, Newspaper, Camera, MessageCircle,
  Utensils, BarChart3, CheckCircle, AlertCircle, Printer, CalendarDays
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = "cours-tom-morel-erp";

// ⚠️ N'OUBLIEZ PAS DE COLLER LA LONGUE LIGNE BASE64 DE VOTRE LOGO ICI
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

  useEffect(() => {
    setActiveTab(defaultTab);
    setQuickFilterFamily(null); 
  }, [defaultTab]);

  const { familiesList, periodsInfo, schedule, menagesSchedule, familyStats, holidays, vacances } = useMemo(() => {
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
      { id: 1, name: "Période 1", desc: "Rentrée (03/09) - Toussaint (17/10)", start: "2026-09-03", end: "2026-10-16", vacStart: "2026-10-17", vacName: "Toussaint" },
      { id: 2, name: "Période 2", desc: "Toussaint (02/11) - Noël (19/12)", start: "2026-11-02", end: "2026-12-18", vacStart: "2026-12-19", vacName: "Noël" },
      { id: 3, name: "Période 3", desc: "Noël (04/01) - Février (13/02)", start: "2027-01-04", end: "2027-02-12", vacStart: "2027-02-13", vacName: "Hiver" },
      { id: 4, name: "Période 4", desc: "Février (01/03) - Pâques (10/04)", start: "2027-03-01", end: "2027-04-09", vacStart: "2027-04-10", vacName: "Pâques" },
      { id: 5, name: "Période 5", desc: "Pâques (26/04) - Été (03/07)", start: "2027-04-26", end: "2027-07-02", vacStart: "2027-07-03", vacName: "Été" }
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

    let scheduleArr = [];
    let menageArr = [];
    let statsObj = {};
    
    famsData.forEach(f => {
      statsObj[f.id] = { cantine: 0, menage: 0, total: 0, lastCantine: null, lastMenage: "2026-01-01" };
    });

    const duoDates = ["2026-09-03", "2026-11-05", "2027-01-07", "2027-03-04"];
    let currentDate = new Date(2026, 8, 3, 12, 0, 0); 
    let endDate = new Date(2027, 6, 3, 12, 0, 0);
    
    let maitresseMardi = "Mme GERARD";
    let isHervetWeek = true;
    let fauvainRiobeThursdays = 0;
    let currentPeriodIdx = 0;
    let periodThursdaysDone = false;

    while (currentDate <= endDate) {
      let dayOfWeek = currentDate.getDay();
      let dateStr = getDateStr(currentDate);

      let pIdx = perData.findIndex(p => dateStr >= p.start && dateStr <= p.end);
      if (pIdx !== -1 && pIdx !== currentPeriodIdx) {
        currentPeriodIdx = pIdx; periodThursdaysDone = false;
      }
      
      const activeP = perData.find(p => dateStr >= p.start && dateStr <= p.end) || perData[0];
      const isSchoolDayFlag = !holiData.includes(dateStr) && !vacData.some(v => dateStr >= v.start && dateStr <= v.end) && [1,2,4,5].includes(dayOfWeek);

      if (isSchoolDayFlag) {
        let requiredParents = 2; let p1 = null, p2 = null; let repasType = ""; let forcedError = false;
        const isInt1 = dateStr <= "2026-09-04"; const isInt2 = dateStr > "2026-09-04" && dateStr <= "2026-09-18";

        if (dayOfWeek === 1) { repasType = "Repas par classe"; } 
        else if (dayOfWeek === 2) { 
          repasType = "Placement libre"; requiredParents = 1; 
          p1 = { id: maitresseMardi }; maitresseMardi = maitresseMardi === "Mme GERARD" ? "Mme SUBLET" : "Mme GERARD"; 
        } 
        else if (dayOfWeek === 4) { repasType = "Filles / Garçons"; } 
        else if (dayOfWeek === 5) { 
          repasType = "Par cordée"; 
          if (isHervetWeek) { requiredParents = 1; p1 = { id: "Mme HERVET" }; }
          isHervetWeek = !isHervetWeek; 
        }

        let parentsToAssign = (requiredParents === 1 && p1) ? 1 : 2;
        let assigned = [];

        if (dayOfWeek === 4 && fauvainRiobeThursdays < 4 && !periodThursdaysDone && currentPeriodIdx < 4) {
          assigned = ["RIOBÉ", "FAUVAIN"];
          fauvainRiobeThursdays++; periodThursdaysDone = true;
          statsObj["RIOBÉ"].cantine++; statsObj["RIOBÉ"].total++; statsObj["RIOBÉ"].lastCantine = dateStr;
          statsObj["FAUVAIN"].cantine++; statsObj["FAUVAIN"].total++; statsObj["FAUVAIN"].lastCantine = dateStr;
        } else {
          for (let i = 0; i < parentsToAssign; i++) {
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
                let hasAncien = (p1 && p1.id && p1.id.startsWith("Mme")) || assigned.some(a => famsData.find(fam => fam.id === a)?.type.startsWith("Ancien"));
                if (hasAncien && f.type.startsWith("Ancien")) return false;
                if (!hasAncien && f.type === "Nouveau" && i === 1) return false;
              }
              return true;
            });

            available.sort((a, b) => statsObj[a.id].total - statsObj[b.id].total);
            if (available.length > 0) {
              assigned.push(available[0].id);
              statsObj[available[0].id].cantine++; statsObj[available[0].id].total++; statsObj[available[0].id].lastCantine = dateStr;
            } else {
              let fallback = famsData.filter(f => !assigned.includes(f.id)).sort((a, b) => statsObj[a.id].total - statsObj[b.id].total);
              if (fallback.length > 0) {
                assigned.push(fallback[0].id);
                statsObj[fallback[0].id].cantine++; statsObj[fallback[0].id].total++; statsObj[fallback[0].id].lastCantine = dateStr;
                forcedError = true;
              }
            }
          }
        }

        let finalP1 = parentsToAssign === 2 ? assigned[0] : (p1 ? p1.id : assigned[0]);
        let finalP2 = parentsToAssign === 2 ? assigned[1] : (p1 ? assigned[0] : null);

        scheduleArr.push({ date: dateStr, period: activeP.id, dayOfWeek, p1: finalP1, p2: finalP2, repasType, isError: forcedError });
      }

      if (dayOfWeek === 5 && isSchoolDayFlag) {
        let nextSat = new Date(currentDate); nextSat.setDate(nextSat.getDate() + 1);
        let nextSatStr = getDateStr(nextSat);
        
        let isHolidayStart = false; let holidayName = "";
        for (let v of vacData) {
          if (nextSatStr === v.start) { isHolidayStart = true; holidayName = "Vacances " + v.name; }
        }

        if (isHolidayStart) {
          let eligibleAsso = famsData.filter(f => f.isAsso && statsObj[f.id].menage < 4);
          if (eligibleAsso.length === 0) eligibleAsso = famsData.filter(f => f.isAsso);
          eligibleAsso.sort((a, b) => statsObj[a.id].total - statsObj[b.id].total || a.id.localeCompare(b.id));
          
          if(eligibleAsso.length > 0) {
            let chosen = eligibleAsso[0].id;
            statsObj[chosen].menage++; statsObj[chosen].total++; statsObj[chosen].lastMenage = dateStr;
            let vacDate = new Date(currentDate); vacDate.setDate(vacDate.getDate() + 1);
            menageArr.push({ date: getDateStr(vacDate), period: activeP.id, familyId: chosen, isVacances: true, label: holidayName });
          }
        } else {
          let candidates = famsData.filter(f => statsObj[f.id].menage === 0);
          if (candidates.length === 0) {
            candidates = famsData.filter(f => {
              if (f.isAsso && statsObj[f.id].menage >= 2) return false;
              return statsObj[f.id].menage < 4;
            });
            if(candidates.length === 0) candidates = famsData.filter(f => statsObj[f.id].menage < 4);
            if(candidates.length === 0) candidates = [...famsData];
          }
          
          candidates.sort((a, b) => {
            let lastA = new Date(statsObj[a.id].lastMenage + "T12:00:00").getTime(); let lastB = new Date(statsObj[b.id].lastMenage + "T12:00:00").getTime();
            let now = currentDate.getTime();
            let penA = (now - lastA < 28 * 24 * 60 * 60 * 1000) ? 100 : 0; let penB = (now - lastB < 28 * 24 * 60 * 60 * 1000) ? 100 : 0;
            let scoreA = statsObj[a.id].total + penA; let scoreB = statsObj[b.id].total + penB;
            if (scoreA === scoreB) return lastA - lastB;
            return scoreA - scoreB;
          });

          if(candidates.length > 0) {
            let chosen = candidates[0].id;
            statsObj[chosen].menage++; statsObj[chosen].total++; statsObj[chosen].lastMenage = dateStr;
            menageArr.push({ date: nextSatStr, period: activeP.id, familyId: chosen, isVacances: false, label: "Ménage Hebdomadaire" });
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let fStats = Object.keys(statsObj).map(id => {
      const fam = famsData.find(f => f.id === id);
      return { id: id, name: fam ? fam.id : id, cantine: statsObj[id].cantine, menage: statsObj[id].menage, total: statsObj[id].total, isTeacher: false };
    });
    
    let teaCantine = (tId) => scheduleArr.filter(s => s.p1 === tId || s.p2 === tId).length;
    fStats.push({ id: "Mme GERARD", name: "Mme GERARD", isTeacher: true, cantine: teaCantine("Mme GERARD"), menage: 0, total: teaCantine("Mme GERARD") });
    fStats.push({ id: "Mme SUBLET", name: "Mme SUBLET", isTeacher: true, cantine: teaCantine("Mme SUBLET"), menage: 0, total: teaCantine("Mme SUBLET") });
    fStats.push({ id: "Mme HERVET", name: "Mme HERVET", isTeacher: true, cantine: teaCantine("Mme HERVET"), menage: 0, total: teaCantine("Mme HERVET") });

    fStats.sort((a, b) => {
      if (a.isTeacher && !b.isTeacher) return 1;
      if (!a.isTeacher && b.isTeacher) return -1;
      return b.total - a.total || a.name.localeCompare(b.name);
    });

    return { familiesList: famsData, periodsInfo: perData, schedule: scheduleArr, menagesSchedule: menageArr, familyStats: fStats, holidays: holiData, vacances: vacData };
  }, []);

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
    "Mme GERARD": "bg-slate-700 text-white border-slate-800",
    "Mme SUBLET": "bg-slate-700 text-white border-slate-800",
    "Mme HERVET": "bg-slate-700 text-white border-slate-800"
  };

  const familyStyles = {
    "TAISSIDRE-CARVALHO": "bg-cyan-100 text-cyan-800 border-cyan-200",
    "DE MALAUSSENE": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    "DE SERRES DE MESPLES": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "DE SERRES": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "LE LÉZEC": "bg-sky-100 text-sky-800 border-sky-200",
    "FIARD": "bg-pink-100 text-pink-800 border-pink-200",
    "GREPAT": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "MELLIES": "bg-teal-100 text-teal-800 border-teal-200",
    "BOCCA": "bg-blue-100 text-blue-800 border-blue-200",
    "BEZIAT-MENUT": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "DE LASTIC ST JAL": "bg-purple-100 text-purple-800 border-purple-200",
    "CHOMEL": "bg-red-100 text-red-800 border-red-200",
    "CORNET-BOUBE": "bg-green-100 text-green-800 border-green-200",
    "RIOBÉ": "bg-orange-100 text-orange-800 border-orange-200",
    "FAUVAIN": "bg-slate-200 text-slate-800 border-slate-300"
  };

  const renderFamilyPill = (id, isError = false, fullWidth = false) => {
    if (!id || id === "ERREUR") return <span key={Math.random()} className={`text-red-500 text-xs italic bg-red-50 px-2 py-0.5 rounded border border-red-200 ${fullWidth ? 'w-full text-center block' : ''}`}>À définir</span>;
    
    let isTeacher = id.startsWith("Mme");
    const famName = isTeacher ? id : (familiesList.find(f => f.id === id)?.name || id);
    let styleClass = isTeacher ? (teacherStyles[id] || "bg-slate-700 text-white") : (familyStyles[famName] || "bg-slate-100 text-slate-800 border-slate-200");
    let errBorder = (isError && !isTeacher) ? "border-red-500 shadow-red-200 border-2" : "border-transparent";
    
    const widthClass = fullWidth ? "w-full justify-center" : "";
    const textClass = fullWidth ? "text-[10px] leading-tight truncate" : "text-[11px]";

    return (
      <button 
        key={`pill-${id}-${Math.random()}`}
        onClick={() => setQuickFilterFamily(id)}
        className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-md border font-bold shadow-sm transition-all hover:opacity-80 active:scale-95 cursor-pointer ${styleClass} ${errBorder} ${widthClass} ${textClass}`}
        title={`Filtrer sur ${famName}`}
      >
        {isTeacher ? <Users size={10} className="shrink-0" /> : null} 
        <span className="truncate">{id}</span>
      </button>
    );
  };

  const displayedCantine = schedule.filter(s => 
    s.period === activePeriod && (!quickFilterFamily || s.p1 === quickFilterFamily || s.p2 === quickFilterFamily)
  );
  
  const displayedMenage = menagesSchedule.filter(m => 
    m.period === activePeriod && (!quickFilterFamily || m.familyId === quickFilterFamily)
  );

  const handleExportCSV = () => {
    let exportData = []; const headers = [];

    if (activeTab === 'cantine') {
      headers.push('Période', 'Date', 'Procédure', 'Intervenant 1', 'Intervenant 2');
      schedule.forEach(r => {
        if (!quickFilterFamily || r.p1 === quickFilterFamily || r.p2 === quickFilterFamily) {
           const pName = periodsInfo.find(p => p.id === r.period)?.name || 'Inconnu';
           exportData.push([pName, r.date, r.repasType, r.p1, r.p2]);
        }
      });
    } else if (activeTab === 'menage') {
      headers.push('Période', 'Date', 'Famille', 'Type');
      menagesSchedule.forEach(r => {
        if (!quickFilterFamily || r.familyId === quickFilterFamily) {
           const pName = periodsInfo.find(p => p.id === r.period)?.name || 'Inconnu';
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
         exportData.push(['Cantine', periodsInfo.find(p=>p.id===r.period)?.name || '', r.date, `Binôme avec : ${partner || 'Aucun'}`]);
      });
      menagesSchedule.filter(m => m.familyId === selectedFamilyFilter).forEach(r => {
         exportData.push(['Ménage', periodsInfo.find(p=>p.id===r.period)?.name || '', r.date, r.label]);
      });
    } else { return; }

    if (exportData.length === 0) return alert("Aucune donnée à exporter.");
    const csvContent = "\uFEFF" + [headers.join(';'), ...exportData.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = 'export_planning_annee_complete.csv'; 
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const renderCalendarGrid = () => {
    const months = [
      { y: 2026, m: 8, name: 'Septembre' }, { y: 2026, m: 9, name: 'Octobre' }, { y: 2026, m: 10, name: 'Novembre' },
      { y: 2026, m: 11, name: 'Décembre' }, { y: 2027, m: 0, name: 'Janvier' }, { y: 2027, m: 1, name: 'Février' },
      { y: 2027, m: 2, name: 'Mars' }, { y: 2027, m: 3, name: 'Avril' }, { y: 2027, m: 4, name: 'Mai' },
      { y: 2027, m: 5, name: 'Juin' }, { y: 2027, m: 6, name: 'Juillet' }
    ];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    let rows = [];
    for (let day = 1; day <= 31; day++) {
      let cells = months.map(mo => {
        let d = new Date(mo.y, mo.m, day, 12, 0, 0);
        if (d.getMonth() !== mo.m) return <div key={`${mo.m}-${day}`} className="bg-slate-50 border-r border-b border-slate-200"></div>;

        const dateStr = getLocalDateString(d);
        const dayWeek = d.getDay();
        const isWeekend = dayWeek === 0 || dayWeek === 6;
        const isHoliday = holidays.includes(dateStr);
        
        let cellClass = "p-1.5 flex flex-col gap-1 border-r border-b border-slate-200 min-h-[50px] text-[9px] ";
        if (isWeekend) cellClass += "bg-slate-50 ";
        if (isHoliday) cellClass += "bg-slate-100 opacity-60 ";

        let cantineEvent = schedule.find(s => s.date === dateStr);
        let menageEvent = menagesSchedule.find(m => {
          if (m.date === dateStr) return true; 
          if (!m.isVacances) {
             let sun = new Date(m.date + "T12:00:00"); sun.setDate(sun.getDate() + 1);
             if (getLocalDateString(sun) === dateStr) return true; 
          }
          return false;
        });

        return (
          <div key={`${mo.m}-${day}`} className={cellClass}>
            <div className="font-bold text-slate-400 mb-0.5 text-center">{dayNames[dayWeek]}</div>
            {cantineEvent && (
              <div className="flex flex-col gap-0.5 items-center w-full">
                {cantineEvent.p1 && renderFamilyPill(cantineEvent.p1, cantineEvent.isError, true)}
                {cantineEvent.p2 && renderFamilyPill(cantineEvent.p2, cantineEvent.isError, true)}
              </div>
            )}
            {menageEvent && (dayWeek === 6 || dayWeek === 0 || menageEvent.isVacances) && (
              <div className="mt-auto pt-0.5 border-t border-slate-100 flex flex-col gap-0.5 items-center w-full">
                <span className="text-[8px] text-indigo-400 uppercase font-bold flex items-center justify-center"><Sparkles size={8} className="mr-0.5 shrink-0"/> Ménage</span>
                {renderFamilyPill(menageEvent.familyId, false, true)}
              </div>
            )}
          </div>
        );
      });

      rows.push(
        <div key={day} className="contents">
          <div className="bg-slate-50 font-bold text-slate-500 border-r border-b border-slate-200 flex items-center justify-center text-xs sticky left-0">{day}</div>
          {cells}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto pb-10 calendar-container print:overflow-visible print:pb-0">
        <div className="grid border-t border-l border-slate-200 min-w-[1200px] calendar-grid print:min-w-0 print:w-full" style={{ gridTemplateColumns: "30px repeat(11, minmax(0, 1fr))" }}>
          <div className="bg-slate-100 border-r border-b-2 border-b-slate-300 sticky top-0 z-10"></div>
          {months.map(mo => <div key={mo.m} className="bg-slate-100 font-bold text-center p-2 border-r border-b-2 border-b-slate-300 sticky top-0 z-10">{mo.name}</div>)}
          {rows}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-transparent font-sans text-slate-800 animate-fade-in relative pb-10">
      <style>{`
        @media print {
          @page { size: landscape; margin: 5mm; }
          aside, header, #main-nav { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; }
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
          .shadow-sm { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          .calendar-container { overflow: visible !important; }
          .calendar-grid { 
             min-width: 100% !important; 
             width: 100% !important; 
             grid-template-columns: 20px repeat(11, minmax(0, 1fr)) !important; 
          }
          .calendar-grid > div { padding: 2px !important; min-height: 35px !important; }
          .border-slate-200 { border-color: #e2e8f0 !important; }
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
                <Download size={16} /> Exporter (Toute l'année)
              </button>
            )}
            <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm flex items-center gap-2">
              <Printer size={16} /> Imprimer (PDF)
            </button>
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
            <span className="font-bold text-sm flex items-center gap-2"><Search size={16} className="text-indigo-600"/> Filtre actif : <span className="uppercase text-indigo-600">{quickFilterFamily}</span></span>
            <button onClick={() => setQuickFilterFamily(null)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition-colors shadow-sm"><AlertCircle size={14} /> Annuler le filtre</button>
          </div>
        )}

        <div className="bg-transparent border-none">
          {activeTab === 'cantine' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8 text-center print:text-left">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3 mb-4"><Utensils className="text-blue-500" /> Planning de la Cantine</h2>
                <div className="flex justify-center md:justify-start mb-6 print:hidden">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-100 p-2 rounded-xl max-w-3xl w-full shadow-inner">
                    {periodsInfo.map(p => (
                      <button key={p.id} onClick={() => setActivePeriod(p.id)} className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${activePeriod === p.id ? 'bg-white shadow-sm text-blue-600 border-blue-200' : 'text-slate-500 border-transparent hover:bg-slate-200'}`}>
                        <div className="font-bold">{p.name}</div><div className="text-[10px] opacity-80">{p.desc.split(' - ')[0]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedCantine.map((row, i) => {
                  let dayBg = "bg-white"; let dayBorder = "border-slate-200";
                  if (row.dayOfWeek === 1) { dayBg = "bg-blue-50/50"; dayBorder = "border-blue-100"; }
                  if (row.dayOfWeek === 2) { dayBg = "bg-purple-50/50"; dayBorder = "border-purple-100"; }
                  if (row.dayOfWeek === 4) { dayBg = "bg-orange-50/50"; dayBorder = "border-orange-100"; }
                  if (row.dayOfWeek === 5) { dayBg = "bg-teal-50/50"; dayBorder = "border-teal-100"; }

                  return (
                    <div key={i} className={`${dayBg} rounded-xl p-4 border ${dayBorder} shadow-sm relative hover:shadow-md transition-shadow flex flex-col`}>
                      <div className="text-sm font-bold text-slate-700 mb-1 border-b border-slate-200/50 pb-2 capitalize">{formatDate(row.date)}</div>
                      <div className="mt-2 mb-3"><span className="bg-white/80 text-slate-600 px-2 py-1 rounded border border-slate-100 text-xs font-semibold shadow-sm inline-block">{row.repasType}</span></div>
                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <span className="text-[10px] uppercase font-bold text-slate-400">P1</span>{renderFamilyPill(row.p1, row.isError)}
                        </div>
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                          <span className="text-[10px] uppercase font-bold text-slate-400">P2</span>{renderFamilyPill(row.p2, row.isError)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'menage' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8 text-center print:text-left">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-3 mb-4"><Sparkles className="text-indigo-500" /> Planning du Ménage</h2>
                <div className="flex justify-center md:justify-start mb-6 print:hidden">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-100 p-2 rounded-xl max-w-3xl w-full shadow-inner">
                    {periodsInfo.map(p => (
                      <button key={p.id} onClick={() => setActivePeriod(p.id)} className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${activePeriod === p.id ? 'bg-white shadow-sm text-indigo-600 border-indigo-200' : 'text-slate-500 border-transparent hover:bg-slate-200'}`}>
                        <div className="font-bold">{p.name}</div><div className="text-[10px] opacity-80">{p.desc.split(' - ')[0]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedMenage.map((row, i) => {
                  let isVac = row.isVacances;
                  let bgCard = isVac ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-white border-slate-200';
                  return (
                    <div key={i} className={`${bgCard} rounded-xl p-5 border shadow-sm relative overflow-hidden flex flex-col h-full hover:shadow-md transition-all`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className={`text-xs font-bold ${isVac ? 'text-amber-500' : 'text-slate-400'} uppercase tracking-wider mb-1 flex items-center gap-2`}><CalendarDays size={14} className={isVac ? 'text-amber-500' : 'text-emerald-500'}/> {row.label}</div>
                          <div className={`text-sm font-bold ${isVac ? 'text-amber-800' : 'text-slate-700'} capitalize mt-2 bg-white/50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block`}>{isVac ? formatDate(row.date) : formatMenageDate(row.date)}</div>
                        </div>
                      </div>
                      <div className="mt-auto bg-white/60 p-3 rounded-lg border border-slate-100/50 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Resp.</span>
                        <div className="flex items-center gap-2">{renderFamilyPill(row.familyId)}{isVac && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 uppercase">Asso</span>}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'calendrier' && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-6 print:text-left">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2"><CalendarDays className="text-blue-500" /> Calendrier Annuel Global</h2>
              </div>
              {renderCalendarGrid()}
            </div>
          )}

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
                        <td className="p-4 font-semibold text-slate-800">{renderFamilyPill(stat.id)}</td>
                        <td className="p-4 text-center text-blue-600 font-bold">{stat.cantine}</td><td className="p-4 text-center text-indigo-600 font-bold">{stat.menage}</td>
                        <td className="p-4 text-center"><span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold border border-slate-200">{stat.total}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
              
              {selectedFamilyFilter ? (() => {
                const isTeacher = selectedFamilyFilter.startsWith("Mme");
                const famInfo = isTeacher ? { type: "Équipe Pédagogique", isAsso: false } : familiesList.find(f => f.id === selectedFamilyFilter);
                let allEvents = [
                    ...schedule.filter(s => s.p1 === selectedFamilyFilter || s.p2 === selectedFamilyFilter).map(s => ({ date: s.date, type: 'Cantine', details: s.repasType, isError: s.isError, period: s.period })),
                    ...menagesSchedule.filter(m => m.familyId === selectedFamilyFilter).map(m => ({ date: m.date, type: 'Ménage', details: m.label, isVacances: m.isVacances, period: m.period }))
                ].sort((a, b) => new Date(a.date) - new Date(b.date));

                return (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-4"><div className="text-xl">{renderFamilyPill(selectedFamilyFilter)}</div><div><div className="text-sm text-slate-500 font-bold uppercase tracking-wider">{famInfo ? famInfo.type : ''} {famInfo && famInfo.isAsso ? '• Membre Asso' : ''}</div><div className="text-slate-800 font-bold mt-1">Total : {allEvents.length} services</div></div></div>
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
                                  let pName = periodsInfo.find(p=>p.id===currentP)?.name || 'Période inconnue';
                                  pHeader = <tr key={`ph-${idx}`}><td colSpan="2" className="bg-slate-100 px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{pName}</td></tr>;
                                }
                                const isCantine = e.type === 'Cantine';
                                const iconClass = isCantine ? 'text-blue-500 bg-blue-100' : (e.isVacances ? 'text-amber-500 bg-amber-100' : 'text-indigo-500 bg-indigo-100');
                                const IconTag = isCantine ? Utensils : (e.isVacances ? CalendarDays : Sparkles);
                                const dateDisplay = (e.type === 'Ménage' && !e.isVacances) ? formatMenageDate(e.date) : formatDate(e.date);

                                return (
                                  <React.Fragment key={`frag-${idx}`}>
                                    {pHeader}
                                    <tr className="hover:bg-slate-50 transition-colors">
                                      <td className="p-4 font-semibold text-slate-700 whitespace-nowrap capitalize">{dateDisplay}</td>
                                      <td className="p-4">
                                          <div className="flex flex-wrap items-center gap-3">
                                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconClass}`}><IconTag size={14} /></div>
                                              <div><strong className="text-slate-800 block">{e.type}</strong><span className="text-slate-500 text-xs">{e.details}</span></div>
                                              {e.isError && !isTeacher && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase tracking-wider border border-red-200 shadow-sm"><AlertTriangle size={10}/> Jour forcé</span>}
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
              })() : (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center bg-white rounded-2xl border border-slate-200 print:hidden">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200"><Search size={32} className="text-slate-300" /></div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Recherche Individuelle</h3>
                  <p>Sélectionnez un nom ci-dessus pour afficher son calendrier personnel.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'regles' && (
            <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6"><Info className="text-blue-500" /> Règles de l'Algorithme</h2>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2 flex items-center gap-2"><Utensils className="text-slate-400" size={18}/> Jours de Cantine</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                      <li><strong>Lundi :</strong> Repas par classe (2 parents)</li><li><strong>Mardi :</strong> Placement libre (1 maîtresse + 1 parent)</li><li><strong>Jeudi :</strong> Filles/Garçons (2 parents)</li><li><strong>Vendredi :</strong> Par cordée (Mme Hervet 1 sem/2, sinon 2 parents)</li>
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
                      <li><strong>Nouveaux :</strong> Ne sont jamais placés 2 jours d'affilée.</li><li><strong>RIOBÉ & FAUVAIN :</strong> Font 4 jeudis en duo (1 par période sur les 4 premières périodes).</li>
                  </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2 flex items-center gap-2"><Sparkles className="text-slate-400" size={18}/> Ménage et Équité</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                      <li>Un ménage est planifié chaque week-end de période scolaire.</li><li>Les 5 ménages des vacances sont réservés aux membres de l'association.</li>
                  </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MODULE : BUDGET PRÉVISIONNEL ---
const BudgetPrevisionnel = ({ transactionsGlobales }) => {
  const [anneeFiltre, setAnneeFiltre] = useState('2025'); // Par défaut Saison 2025-2026
  
  // Simulation des saisies budgétaires (qui seraient sauvegardées en base de données)
  const [budgets, setBudgets] = useState({
    depenses: {
      salaires: { prev: 62300, raf: 0, nom: "Salaires + URSAFF + Cotisations", comptes: ['64'] },
      assurances: { prev: 3000, raf: 0, nom: "Fidem + Assurances + Téléphonie", comptes: ['616', '626', '628'] },
      loyers: { prev: 13800, raf: 0, nom: "Loyers", comptes: ['613'] },
      fonctionnement: { prev: 5000, raf: 0, nom: "Fonct. + Uniformes + Energie + Banque", comptes: ['606', '627'] },
      travaux: { prev: 2000, raf: 0, nom: "Travaux", comptes: ['615'] }
    },
    recettes: {
      inscriptions: { prev: 800, raf: 0, nom: "Inscriptions + Fournitures", comptes: ['706'] },
      scolarite: { prev: 25740, raf: 0, nom: "Scolarité + Subvention", comptes: ['706', '74'] },
      uniformes: { prev: 336, raf: 0, nom: "Uniformes", comptes: ['707'] },
      dons: { prev: 58724, raf: 0, nom: "Dons", comptes: ['754'] },
      manifestations: { prev: 500, raf: 0, nom: "Manifestation + Sortie", comptes: ['708'] }
    }
  });

  const handleBudgetChange = (section, key, field, value) => {
    setBudgets(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: { ...prev[section][key], [field]: Number(value) || 0 } }
    }));
  };

  // Filtrer les transactions pour l'année sélectionnée
  const extractExercice = (dateStr) => {
    if (!dateStr) return null;
    const str = String(dateStr).trim();
    let m, y;
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) { m = parseInt(parts[1], 10); y = parseInt(parts[2], 10); }
    } else if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) { y = parseInt(parts[0], 10); m = parseInt(parts[1], 10); }
        else { y = parseInt(parts[2], 10); m = parseInt(parts[1], 10); }
      }
    }
    if (m && y) {
      if (y < 100) y += 2000;
      return m >= 9 ? y : y - 1;
    }
    return null;
  };

  const currentTxs = useMemo(() => {
    if (anneeFiltre === 'TOTAL') return transactionsGlobales;
    return (transactionsGlobales || []).filter(t => extractExercice(t.date) === Number(anneeFiltre));
  }, [transactionsGlobales, anneeFiltre]);

  // Calcul du Réel depuis le Grand Livre
  const calcReel = (comptesPrefixes, isRecette) => {
    return currentTxs.reduce((acc, t) => {
      let mt = 0;
      const tCompteD = String(t.compteDebit || '').trim();
      const tCompteC = String(t.compteCredit || '').trim();
      const tCompte = String(t.compte || '').trim();

      const match = comptesPrefixes.some(prefix => 
        tCompteD.startsWith(prefix) || tCompteC.startsWith(prefix) || tCompte.startsWith(prefix)
      );

      if (match) {
        if (t.type === 'od') {
          if (isRecette && tCompteC.startsWith(comptesPrefixes[0])) mt = Math.abs(t.montant);
          if (!isRecette && tCompteD.startsWith(comptesPrefixes[0])) mt = Math.abs(t.montant);
        } else {
          if (isRecette && t.montant > 0) mt = Math.abs(t.montant);
          if (!isRecette && t.montant < 0) mt = Math.abs(t.montant);
        }
      }
      return acc + mt;
    }, 0);
  };

  const formatMontant = (val) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

  const renderRow = (item, key, section) => {
    const isRecette = section === 'recettes';
    const reel = calcReel(item.comptes, isRecette);
    const atterrissage = reel + item.raf;
    const ecart = atterrissage - item.prev; // Pour dépenses : Positif = Dépassement (Rouge). Pour Recettes : Positif = Bonus (Vert)
    
    let isWarning = false;
    if (!isRecette && ecart > 0) isWarning = true; // Dépense supérieure au budget
    if (isRecette && ecart < 0) isWarning = true; // Recette inférieure au budget

    const pct = item.prev > 0 ? Math.min((reel / item.prev) * 100, 100) : 0;

    return (
      <tr key={key} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group">
        <td className={`py-3 px-4 font-bold ${!isRecette ? 'text-rose-700' : 'text-emerald-700'}`}>{item.nom}</td>
        <td className="py-3 px-4 bg-slate-100/50">
          <div className="flex items-center gap-1 border border-slate-200 rounded px-2 py-1 bg-white focus-within:ring-2 ring-indigo-500">
            <input type="number" value={item.prev} onChange={(e) => handleBudgetChange(section, key, 'prev', e.target.value)} className="w-full text-right outline-none text-slate-800 font-bold bg-transparent" />
            <span className="text-slate-400 text-xs">€</span>
          </div>
        </td>
        <td className="py-3 px-4 text-right font-black text-slate-700 relative">
          <div className="flex flex-col items-end">
            <span>{formatMontant(reel)} €</span>
            <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
              <div className={`h-full ${!isRecette ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }}></div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1 border border-slate-200 rounded px-2 py-1 bg-white focus-within:ring-2 ring-indigo-500">
            <input type="number" value={item.raf} onChange={(e) => handleBudgetChange(section, key, 'raf', e.target.value)} className="w-full text-right outline-none text-slate-600 font-medium bg-transparent" />
            <span className="text-slate-400 text-xs">€</span>
          </div>
        </td>
        <td className="py-3 px-4 text-right font-black text-indigo-900 bg-indigo-50/30">{formatMontant(atterrissage)} €</td>
        <td className={`py-3 px-4 text-right font-black ${isWarning ? 'text-rose-600' : 'text-slate-600'}`}>
          {ecart > 0 ? '+' : ''}{formatMontant(ecart)} €
        </td>
        <td className="py-3 px-4">
          <input type="text" placeholder="Commentaire..." className="w-full border-none outline-none text-xs text-slate-500 bg-transparent focus:ring-1 ring-slate-200 rounded px-1" />
        </td>
      </tr>
    );
  };

  const totPrevDep = Object.values(budgets.depenses).reduce((acc, i) => acc + i.prev, 0);
  const totReelDep = Object.values(budgets.depenses).reduce((acc, i) => acc + calcReel(i.comptes, false), 0);
  const totRafDep = Object.values(budgets.depenses).reduce((acc, i) => acc + i.raf, 0);
  const totAttDep = totReelDep + totRafDep;

  const totPrevRec = Object.values(budgets.recettes).reduce((acc, i) => acc + i.prev, 0);
  const totReelRec = Object.values(budgets.recettes).reduce((acc, i) => acc + calcReel(i.comptes, true), 0);
  const totRafRec = Object.values(budgets.recettes).reduce((acc, i) => acc + i.raf, 0);
  const totAttRec = totReelRec + totRafRec;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans animate-fade-in">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="text-indigo-600" /> Budget Prévisionnel vs Réel
          </h2>
          <p className="text-slate-500 text-sm mt-1">Saisissez votre budget, la colonne "Réel" se remplit automatiquement depuis le Grand Livre.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Calendar size={18} className="text-slate-500" />
          <select value={anneeFiltre} onChange={(e) => setAnneeFiltre(e.target.value)} className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none cursor-pointer">
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>Saison {year}-{year + 1}</option>
            ))}
          </select>
        </div>
      </div>

      {/* RÉSULTAT GLOBAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Budget Prévu (Résultat)</h3>
          <p className={`text-3xl font-black ${totPrevRec - totPrevDep >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatMontant(totPrevRec - totPrevDep)} €</p>
        </div>
        <div className="bg-indigo-50/50 p-6 rounded-2xl shadow-sm border border-indigo-100">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Réel Actuel (Résultat)</h3>
          <p className={`text-3xl font-black ${totReelRec - totReelDep >= 0 ? 'text-indigo-700' : 'text-rose-600'}`}>{formatMontant(totReelRec - totReelDep)} €</p>
        </div>
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Atterrissage Projeté</h3>
          <p className={`text-3xl font-black ${totAttRec - totAttDep >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatMontant(totAttRec - totAttDep)} €</p>
        </div>
      </div>

      {/* TABLEAU DES DÉPENSES */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-rose-50 border-b border-rose-100 p-4">
          <h3 className="font-black text-rose-800 text-lg flex items-center gap-2"><TrendingUp className="rotate-180" size={20}/> DÉPENSES</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 min-w-[250px]">Postes</th>
                <th className="py-3 px-4 w-40 bg-slate-100/50">Budget Prévisionnel</th>
                <th className="py-3 px-4 w-32 text-right">Réel auto (GL)</th>
                <th className="py-3 px-4 w-32">Reste à faire (RAF)</th>
                <th className="py-3 px-4 w-32 text-right bg-indigo-50/30">Atterrissage</th>
                <th className="py-3 px-4 w-32 text-right">Écart / Budget</th>
                <th className="py-3 px-4 min-w-[200px]">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(budgets.depenses).map(key => renderRow(budgets.depenses[key], key, 'depenses'))}
              {/* TOTAL DÉPENSES */}
              <tr className="bg-rose-50/50 border-t-2 border-rose-200">
                <td className="py-3 px-4 font-black text-rose-900 uppercase">TOTAL DÉPENSES</td>
                <td className="py-3 px-4 text-right font-black text-slate-800">{formatMontant(totPrevDep)} €</td>
                <td className="py-3 px-4 text-right font-black text-slate-800">{formatMontant(totReelDep)} €</td>
                <td className="py-3 px-4 text-right font-black text-slate-800">{formatMontant(totRafDep)} €</td>
                <td className="py-3 px-4 text-right font-black text-indigo-900">{formatMontant(totAttDep)} €</td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLEAU DES RECETTES */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-emerald-50 border-b border-emerald-100 p-4">
          <h3 className="font-black text-emerald-800 text-lg flex items-center gap-2"><TrendingUp size={20}/> RECETTES</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 min-w-[250px]">Postes</th>
                <th className="py-3 px-4 w-40 bg-slate-100/50">Budget Prévisionnel</th>
                <th className="py-3 px-4 w-32 text-right">Réel auto (GL)</th>
                <th className="py-3 px-4 w-32">Reste à faire (RAF)</th>
                <th className="py-3 px-4 w-32 text-right bg-indigo-50/30">Atterrissage</th>
                <th className="py-3 px-4 w-32 text-right">Écart / Budget</th>
                <th className="py-3 px-4 min-w-[200px]">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(budgets.recettes).map(key => renderRow(budgets.recettes[key], key, 'recettes'))}
              {/* TOTAL RECETTES */}
              <tr className="bg-emerald-50/50 border-t-2 border-emerald-200">
                <td className="py-3 px-4 font-black text-emerald-900 uppercase">TOTAL RECETTES</td>
                <td className="py-3 px-4 text-right font-black text-slate-800">{formatMontant(totPrevRec)} €</td>
                <td className="py-3 px-4 text-right font-black text-slate-800">{formatMontant(totReelRec)} €</td>
                <td className="py-3 px-4 text-right font-black text-slate-800">{formatMontant(totRafRec)} €</td>
                <td className="py-3 px-4 text-right font-black text-indigo-900">{formatMontant(totAttRec)} €</td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// --- NOUVEAU MODULE : VIE DE L'ÉCOLE ---
const VieEcole = () => (
  <div className="space-y-6 max-w-6xl mx-auto pb-10 font-sans animate-fade-in">
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Newspaper className="text-indigo-600" /> Vie de l'école
        </h2>
        <p className="text-slate-500 text-sm mt-1">Retrouvez les dernières lettres aux parents, les photos et les actualités des classes.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lettres aux parents */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <FileText className="text-blue-500" size={20} /> Lettres aux parents
         </h3>
         <div className="space-y-3">
           <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors cursor-pointer group">
             <div className="flex items-center gap-3">
               <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><FileText size={16} /></div>
               <div>
                 <p className="font-bold text-sm text-slate-700">Lettre de rentrée - Période 1</p>
                 <p className="text-[10px] text-slate-400">Exemple de document</p>
               </div>
             </div>
             <Download size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
           </div>
           <div className="text-center mt-4">
             <p className="text-xs text-slate-400 italic">Espace d'administration à venir pour déposer vos PDF...</p>
           </div>
         </div>
      </div>

      {/* Photos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <Camera className="text-emerald-500" size={20} /> Galerie Photos
         </h3>
         <div className="grid grid-cols-2 gap-3">
           <div className="aspect-video bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 border-dashed hover:bg-slate-100 cursor-pointer transition-colors">
             <span className="text-xs text-slate-400 font-medium text-center px-2">Sortie Forêt<br/>(Album vide)</span>
           </div>
           <div className="aspect-video bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 border-dashed hover:bg-slate-100 cursor-pointer transition-colors">
             <span className="text-xs text-slate-400 font-medium text-center px-2">Atelier Peinture<br/>(Album vide)</span>
           </div>
         </div>
      </div>
    </div>
  </div>
);

// --- NOUVEAU MODULE : FICHE TRAVAUX ---
const FicheTravaux = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto mt-6">
    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
      <Hammer className="text-indigo-600" /> Fiche Travaux
    </h2>
    <p className="text-slate-500">
      Ceci est l'espace dédié aux fiches de travaux pour les parents d'élèves. Le module complet (formulaire et suivi) sera développé très prochainement.
    </p>
  </div>
);

const InfosContact = () => (
  <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-10">
    <div className="bg-blue-600 p-8 rounded-xl shadow-md text-white">
      <h1 className="text-3xl font-bold mb-2">Bienvenue sur le portail du Cours Tom Morel</h1>
      <p className="text-blue-100">Retrouvez ici toutes les informations de scolarité.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
          <Globe size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Le Cours Tom Morel</h3>
        <p className="text-blue-500 text-sm mb-6">24 rue de la Chapelle, Saint-Chef</p>
        <div className="flex-1"></div>
        <a href="https://sites.google.com/view/courstommorel/cours-tom-morel" target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm">
          <Globe size={18} /> Visiter le site
        </a>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
          <Mail size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Direction de l'École</h3>
        <p className="text-slate-600 text-sm font-medium mb-1">Mme Laurence Gérard</p>
        <p className="text-slate-400 text-xs mb-5">Équipe enseignante: Mme Cécile Sublet & Mme Florence Hervet</p>
        
        <a href="tel:0667909576" className="w-full border border-slate-200 hover:bg-slate-50 rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-slate-600 text-sm font-bold transition-colors">
          <Phone size={16} /> 06 67 90 95 76
        </a>
        
        <a href="mailto:direction.tom.morel@gmail.com" className="w-full inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm">
          <Mail size={18} /> Écrire
        </a>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
          <Building size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Association (Bureau)</h3>
        <p className="text-purple-500 text-sm mb-6">Mon École en Dauphiné</p>
        <div className="flex-1"></div>
        <div className="w-full border border-slate-200 rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
          <Phone size={16} /> -
        </div>
        <a href="mailto:monecoleendauphine@gmail.com" className="w-full inline-flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm">
          <Mail size={18} /> Écrire
        </a>
      </div>
    </div>

    {/* NOUVEAU : BLOC SUPPORT TECHNIQUE */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4 text-center md:text-left">
        <div className="hidden md:flex w-12 h-12 rounded-full bg-amber-50 text-amber-500 items-center justify-center shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Support Technique ERP</h3>
          <p className="text-slate-500 text-sm mt-1">Un souci avec l'application, un bug ou une erreur dans vos données ? Contactez l'administrateur (L. Le Lezec).</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto shrink-0">
        <a href="https://wa.me/33783424110" target="_blank" rel="noreferrer" className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl transition-colors font-bold text-sm">
          <MessageCircle size={16} /> WhatsApp
        </a>
        <a href="sms:0783424110" className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl transition-colors font-bold text-sm">
          <MessageCircle size={16} /> SMS
        </a>
        <a href="mailto:lvlelezec@gmail.com" className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl transition-colors font-bold text-sm">
          <Mail size={16} /> E-mail
        </a>
      </div>
    </div>
  </div>
);

// --- FONCTIONS UTILITAIRES GLOBALES ---
const normaliserDateFR = (rawVal) => {
  if (!rawVal) return '';

  if (rawVal instanceof Date && !isNaN(rawVal)) {
    const safeDate = new Date(rawVal.getTime() + (12 * 60 * 60 * 1000));
    const d = String(safeDate.getUTCDate()).padStart(2, '0');
    const m = String(safeDate.getUTCMonth() + 1).padStart(2, '0');
    const y = safeDate.getUTCFullYear();
    return `${d}/${m}/${y}`;
  }

  if (typeof rawVal === 'number') {
    const jsDate = new Date(Math.round((rawVal - 25569) * 86400 * 1000));
    const safeDate = new Date(jsDate.getTime() + (12 * 60 * 60 * 1000));
    const d = String(safeDate.getUTCDate()).padStart(2, '0');
    const m = String(safeDate.getUTCMonth() + 1).padStart(2, '0');
    const y = safeDate.getUTCFullYear();
    return `${d}/${m}/${y}`;
  }

  let str = String(rawVal).trim();
  str = str.split('T')[0];
  str = str.replace(/-/g, '/');

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) { 
        const [y, m, d] = parts;
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      } else { 
        let [d, m, y] = parts;
        if (y.length === 2) y = '20' + y;
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      }
    }
  }
  return str;
};

const formatMontant = (montant) => {
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(montant || 0);
};

const SearchableCompteSelect = ({ value, onChange, comptesList, placeholder = "Sélectionner un compte..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizeStr = (str) => String(str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredComptes = useMemo(() => {
    if (!search.trim()) return comptesList;
    const term = normalizeStr(search);
    return comptesList.filter(c => 
      normalizeStr(c.code).includes(term) || 
      normalizeStr(c.libelle).includes(term)
    );
  }, [comptesList, search]);

  const selectedCompte = comptesList.find(c => c.code === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left border rounded-xl px-3 py-2 text-xs font-mono font-bold flex justify-between items-center transition-all bg-white shadow-2xs ${
          value ? 'border-indigo-300 bg-indigo-50/80 text-indigo-900' : 'border-slate-200 text-slate-400'
        }`}
      >
        <span className="truncate">
          {selectedCompte ? `${selectedCompte.code} - ${selectedCompte.libelle}` : (value ? `${value} (Suggéré)` : placeholder)}
        </span>
        <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Code ou libellé (ex : AS, 616)..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 font-sans"
              autoFocus
            />
          </div>
          <div className="space-y-0.5">
            {filteredComptes.length > 0 ? (
              filteredComptes.map(c => (
                <div 
                  key={c.id}
                  onClick={() => {
                    onChange(c.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs cursor-pointer flex justify-between items-center transition-colors ${
                    c.code === value ? 'bg-indigo-100 text-indigo-950 font-extrabold' : 'hover:bg-slate-100/80 text-slate-700 font-medium'
                  }`}
                >
                  <span className="font-mono font-extrabold text-indigo-700 shrink-0">{c.code}</span>
                  <span className="truncate text-slate-600 ml-2 text-right flex-1">{c.libelle}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-3">Aucun compte correspondant</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- TABLEAU DE BORD (DASHBOARD) ---
const TableauBord = ({ transactionsGlobales }) => {
  const [anneeFiltre, setAnneeFiltre] = useState('TOTAL');

  const formatMontant = (val) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
  
  const calcPct = (valeur, total) => total > 0 ? ((valeur / total) * 100).toFixed(1) : "0.0";

  const extractDateInfo = (dateStr) => {
    if (!dateStr) return null;
    const parts = String(dateStr).split('/');
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10);
      let y = parseInt(parts[2], 10);
      if (y < 100) y += 2000;
      const exercice = m >= 9 ? y : y - 1;
      return { month: m, year: y, exercice };
    }
    return null;
  };

  const data = useMemo(() => {
    let totalRecettes = 0;
    let totalDepenses = 0;
    let tresorerieGlobale = 0;

    const anneesListe = [2021, 2022, 2023, 2024, 2025, 2026];
    const statsParAnnee = {};
    anneesListe.forEach(y => {
      statsParAnnee[y] = { id: y, nom: `${y}-${y+1}`, recettes: 0, depenses: 0 };
    });

    const moisScolaires = [
      { id: 9, nom: 'Sep', recettes: 0, depenses: 0 }, { id: 10, nom: 'Oct', recettes: 0, depenses: 0 },
      { id: 11, nom: 'Nov', recettes: 0, depenses: 0 }, { id: 12, nom: 'Déc', recettes: 0, depenses: 0 },
      { id: 1, nom: 'Jan', recettes: 0, depenses: 0 }, { id: 2, nom: 'Fév', recettes: 0, depenses: 0 },
      { id: 3, nom: 'Mar', recettes: 0, depenses: 0 }, { id: 4, nom: 'Avr', recettes: 0, depenses: 0 },
      { id: 5, nom: 'Mai', recettes: 0, depenses: 0 }, { id: 6, nom: 'Juin', recettes: 0, depenses: 0 },
      { id: 7, nom: 'Juil', recettes: 0, depenses: 0 }, { id: 8, nom: 'Aoû', recettes: 0, depenses: 0 }
    ];

    const depensesParCategorie = {};
    const recettesParCategorie = {};

    const addCat = (obj, compte, montant) => {
      const prefix = String(compte).substring(0, 2);
      if (!obj[prefix]) obj[prefix] = 0;
      obj[prefix] += montant;
    };

    (transactionsGlobales || []).forEach(t => {
      const isOD = t.type === 'od';
      const m = Number(t.montant) || 0;
      const absM = Math.abs(m);

      if (!isOD) {
        tresorerieGlobale += m; 
      } else {
        if (String(t.compteDebit).startsWith('5')) tresorerieGlobale += absM;
        if (String(t.compteCredit).startsWith('5')) tresorerieGlobale -= absM;
      }

      const dateInfo = extractDateInfo(t.date);
      if (!dateInfo) return; 

      let valDepense = 0;
      let valRecette = 0;
      let catDepense = null;
      let catRecette = null;

      if (isOD) {
        const dCode = String(t.compteDebit || '');
        const cCode = String(t.compteCredit || '');
        
        if (dCode.startsWith('6')) { valDepense += absM; catDepense = dCode; }
        if (cCode.startsWith('6')) { valDepense -= absM; catDepense = cCode; } 
        if (cCode.startsWith('7')) { valRecette += absM; catRecette = cCode; }
        if (dCode.startsWith('7')) { valRecette -= absM; catRecette = dCode; } 
      } else {
        const compte = String(t.compte || '');
        if (compte.startsWith('6')) {
          if (m < 0) { valDepense += absM; catDepense = compte; } 
          else { valDepense -= absM; catDepense = compte; } 
        } else if (compte.startsWith('7')) {
          if (m > 0) { valRecette += absM; catRecette = compte; } 
          else { valRecette -= absM; catRecette = compte; } 
        }
      }

      if (statsParAnnee[dateInfo.exercice]) {
        statsParAnnee[dateInfo.exercice].recettes += valRecette;
        statsParAnnee[dateInfo.exercice].depenses += valDepense;
      }

      const isDansFiltre = anneeFiltre === 'TOTAL' || Number(anneeFiltre) === dateInfo.exercice;

      if (isDansFiltre) {
        totalRecettes += valRecette;
        totalDepenses += valDepense;
        if (catDepense) addCat(depensesParCategorie, catDepense, valDepense);
        if (catRecette) addCat(recettesParCategorie, catRecette, valRecette);

        if (anneeFiltre !== 'TOTAL') {
          const moisRef = moisScolaires.find(ms => ms.id === dateInfo.month);
          if (moisRef) {
            moisRef.recettes += valRecette;
            moisRef.depenses += valDepense;
          }
        }
      }
    });

    const categoriesNoms = {
      '60': 'Achats & Fournitures', '61': 'Services Extérieurs', '62': 'Frais Bancaires & Autres',
      '63': 'Impôts & Taxes', '64': 'Salaires & Charges', '65': 'Autres charges', '66': 'Frais Financiers', '68': 'Amortissements',
      '70': 'Scolarité & Ventes', '74': 'Subventions', '75': 'Dons & Mécénats', '76': 'Produits Financiers'
    };

    const formatTop = (obj) => Object.entries(obj)
      .map(([k, v]) => ({ nom: categoriesNoms[k] || `Classe ${k}`, montant: v }))
      .filter(item => item.montant > 0)
      .sort((a, b) => b.montant - a.montant)
      .slice(0, 6);

    return {
      totalRecettes,
      totalDepenses,
      resultat: totalRecettes - totalDepenses,
      tresorerieGlobale,
      moisScolaires,
      anneesStats: anneesListe.map(y => statsParAnnee[y]),
      topDepenses: formatTop(depensesParCategorie),
      topRecettes: formatTop(recettesParCategorie)
    };
  }, [transactionsGlobales, anneeFiltre]);

  const isVueGlobale = anneeFiltre === 'TOTAL';
  const dataGraphique = isVueGlobale ? data.anneesStats : data.moisScolaires;
  const maxGraphValue = Math.max(...dataGraphique.map(d => Math.max(d.recettes, d.depenses)), 1000);

  const margeNette = calcPct(data.resultat, data.totalRecettes);
  const tauxAbsorption = calcPct(data.totalDepenses, data.totalRecettes);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="text-indigo-600" /> Direction Financière
          </h2>
          <p className="text-slate-500 text-sm mt-1">Analyse des flux, ratios de gestion et répartition budgétaire.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-inner">
          <Calendar size={18} className="text-slate-500" />
          <select 
            value={anneeFiltre} 
            onChange={(e) => setAnneeFiltre(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="TOTAL" className="font-bold text-indigo-700">⭐ Historique Complet</option>
            <option disabled>──────────────</option>
            {[2021, 2022, 2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>Exercice {year}-{year + 1}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-blue-300 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trésorerie Actuelle</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building size={16} /></div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{formatMontant(data.tresorerieGlobale)} €</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1">Liquidités disponibles (Banque/Caisse)</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-emerald-300 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Produits (Recettes)</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{formatMontant(data.totalRecettes)} €</p>
            <p className="text-[10px] font-medium text-emerald-600 mt-1 bg-emerald-50 w-fit px-2 py-0.5 rounded">Base de calcul : 100%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:border-rose-300 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Charges (Dépenses)</p>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><TrendingUp size={16} className="rotate-180" /></div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{formatMontant(data.totalDepenses)} €</p>
            <p className="text-[10px] font-bold text-rose-600 mt-1 bg-rose-50 w-fit px-2 py-0.5 rounded">Absorbe {tauxAbsorption}% des recettes</p>
          </div>
        </div>

        <div className={`bg-white p-5 rounded-2xl shadow-sm border flex flex-col justify-between group transition-colors ${data.resultat >= 0 ? 'border-indigo-200 hover:border-indigo-400' : 'border-orange-200 hover:border-orange-400'}`}>
          <div className="flex justify-between items-start mb-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Résultat Net</p>
            <div className={`p-2 rounded-lg ${data.resultat >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}><PieChart size={16} /></div>
          </div>
          <div>
            <p className={`text-2xl font-black ${data.resultat >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
              {data.resultat > 0 ? '+' : ''}{formatMontant(data.resultat)} €
            </p>
            <p className={`text-[10px] font-bold mt-1 w-fit px-2 py-0.5 rounded ${data.resultat >= 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>
              Marge Nette : {margeNette}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {isVueGlobale ? "Comparatif Annuel des Exercices" : `Évolution mensuelle (Saison ${anneeFiltre}-${Number(anneeFiltre)+1})`}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Mise en relation des produits et des charges par période.</p>
            </div>
            {isVueGlobale && <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100">Vue Globale</span>}
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 h-64 mt-2 border-b border-slate-100 pb-2">
            {dataGraphique.map(item => {
              const hRec = Math.max((item.recettes / maxGraphValue) * 100, 0);
              const hDep = Math.max((item.depenses / maxGraphValue) * 100, 0);
              const isBenefice = item.recettes >= item.depenses;
              const resultValue = Math.abs(item.recettes - item.depenses);
              
              return (
                <div key={item.nom} className="flex flex-col items-center flex-1 group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-800 text-white text-[11px] p-3 rounded-xl pointer-events-none z-10 whitespace-nowrap shadow-xl border border-slate-700">
                    <p className="text-slate-400 font-bold mb-1.5 border-b border-slate-600 pb-1.5">{isVueGlobale ? `Exercice ${item.nom}` : `Mois de ${item.nom}`}</p>
                    <div className="flex justify-between gap-6 items-center mb-1">
                      <span className="text-emerald-400">Produits</span>
                      <span className="font-mono font-bold">+ {formatMontant(item.recettes)} €</span>
                    </div>
                    <div className="flex justify-between gap-6 items-center">
                      <span className="text-rose-400">Charges</span>
                      <span className="font-mono font-bold">- {formatMontant(item.depenses)} €</span>
                    </div>
                    <div className={`mt-2 pt-2 border-t border-slate-600 flex justify-between gap-6 items-center ${isBenefice ? 'text-indigo-300' : 'text-orange-400'}`}>
                      <span className="font-bold">Résultat</span>
                      <span className="font-mono font-black">{isBenefice ? '+' : '-'}{formatMontant(resultValue)} €</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 w-full justify-center h-48 items-end relative">
                    <div className="absolute inset-0 bg-slate-50/50 -z-10 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-[35%] bg-emerald-400 rounded-t-sm transition-all duration-500 shadow-sm" style={{ height: `${hRec}%`, minHeight: item.recettes > 0 ? '4px' : '0' }}></div>
                    <div className="w-[35%] bg-rose-400 rounded-t-sm transition-all duration-500 shadow-sm" style={{ height: `${hDep}%`, minHeight: item.depenses > 0 ? '4px' : '0' }}></div>
                  </div>
                  <span className={`text-[10px] font-bold mt-2 uppercase ${isVueGlobale ? 'text-slate-600 bg-slate-100 px-2 py-0.5 rounded' : 'text-slate-400'}`}>
                    {item.nom}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center gap-8 mt-6 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-400 rounded-sm shadow-sm"></div> Produits (Recettes)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-400 rounded-sm shadow-sm"></div> Charges (Dépenses)</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-sm border-b border-slate-100 pb-3">
              <PieChart className="text-rose-500" size={18} /> Répartition des Charges
            </h3>
            <div className="space-y-4.5 flex-1">
              {data.topDepenses.length === 0 ? <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">Aucune donnée</div> : null}
              {data.topDepenses.map((item, idx) => {
                const pct = calcPct(item.montant, data.totalDepenses);
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                      <span className="text-slate-600 truncate mr-2">{item.nom}</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md text-[9px] w-10 text-center">{pct}%</span>
                        <span className="text-rose-600 font-mono whitespace-nowrap w-16 text-right">{formatMontant(item.montant)} €</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-rose-400 h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-sm border-b border-slate-100 pb-3">
              <PieChart className="text-emerald-500" size={18} /> Répartition des Produits
            </h3>
            <div className="space-y-4.5 flex-1">
              {data.topRecettes.length === 0 ? <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">Aucune donnée</div> : null}
              {data.topRecettes.map((item, idx) => {
                const pct = calcPct(item.montant, data.totalRecettes);
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                      <span className="text-slate-600 truncate mr-2">{item.nom}</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md text-[9px] w-10 text-center">{pct}%</span>
                        <span className="text-emerald-600 font-mono whitespace-nowrap w-16 text-right">{formatMontant(item.montant)} €</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ÉTAT FINANCIER (Bilan & Résultat Groupés) ---
const EtatFinancier = ({ transactionsGlobales }) => {
  
  const formatMontant = (valeur) => {
    const num = Number(valeur);
    if (isNaN(num)) return "0,00";
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(num);
  };

  const safeTransactions = transactionsGlobales || [];

  const [anneeDebut, setAnneeDebut] = useState('TOTAL');
  const [detailsOuverts, setDetailsOuverts] = useState({});
  const [comptesList, setComptesList] = useState([]);

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'comptes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste = [];
      snapshot.forEach((doc) => {
        liste.push({ id: doc.id, ...doc.data() });
      });
      setComptesList(liste);
    });
    return () => unsubscribe();
  }, []);

  const toggleDetail = (categorie) => {
    setDetailsOuverts(prev => ({ ...prev, [categorie]: !prev[categorie] }));
  };

  const PREFIXES = {
    '10': 'Capital, réserves et fonds associatifs',
    '11': 'Report à nouveau',
    '12': 'Résultat de l\'exercice',
    '13': 'Subventions d\'investissement',
    '15': 'Provisions',
    '16': 'Emprunts et dettes',
    '19': 'Fonds dédiés',
    '20': 'Immobilisations incorporelles',
    '21': 'Immobilisations corporelles',
    '27': 'Autres immobilisations financières',
    '28': 'Amortissements des immobilisations',
    '31': 'Matières premières',
    '37': 'Stocks de marchandises',
    '40': 'Fournisseurs et comptes rattachés',
    '41': 'Usagers, familles et comptes rattachés',
    '42': 'Personnel et comptes rattachés',
    '43': 'Sécurité sociale et autres org. sociaux',
    '44': 'État et autres collectivités publiques',
    '46': 'Débiteurs divers et créditeurs divers',
    '47': 'Comptes transitoires ou d\'attente',
    '48': 'Comptes de régularisation',
    '51': 'Banques, établissements financiers',
    '53': 'Caisse',
    '58': 'Virements internes',
    '60': 'Achats',
    '61': 'Services extérieurs',
    '62': 'Autres services extérieurs',
    '63': 'Impôts, taxes et versements assimilés',
    '64': 'Charges de personnel',
    '65': 'Autres charges de gestion courante',
    '66': 'Charges financières',
    '67': 'Charges exceptionnelles',
    '68': 'Dotations aux amortissements',
    '70': 'Ventes de produits, prestations',
    '74': 'Subventions d\'exploitation',
    '75': 'Autres produits de gestion courante',
    '76': 'Produits financiers',
    '77': 'Produits exceptionnels',
    '78': 'Reprises sur amortissements',
    '79': 'Transferts de charges'
  };

  const getCompteLibelle = (code) => {
    const codeStr = String(code).trim();
    const c = comptesList.find(x => String(x.code).trim() === codeStr);
    if (c) return c.libelle;
    if (codeStr === '512000') return 'Banque';
    return '';
  };

  const parseDateForFilter = (dStr) => {
    if (!dStr) return 0;
    const str = String(dStr).trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        return new Date(year, month, day).getTime();
      }
    } else if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) { 
          return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
        } else { 
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
        }
      }
    }
    return new Date(str).getTime() || 0;
  };

  const { anterieures, exercice } = useMemo(() => {
    if (anneeDebut === 'TOTAL') {
      return { anterieures: [], exercice: safeTransactions };
    }

    const start = new Date(Number(anneeDebut), 8, 1, 0, 0, 0).getTime(); 
    const end = new Date(Number(anneeDebut) + 1, 7, 31, 23, 59, 59).getTime(); 

    const ant = [];
    const exo = [];

    safeTransactions.forEach(t => {
      if (!t || !t.date) return;
      const tTime = parseDateForFilter(t.date);
      if (tTime < start) ant.push(t);
      else if (tTime >= start && tTime <= end) exo.push(t);
    });

    return { anterieures: ant, exercice: exo };
  }, [safeTransactions, anneeDebut]);

  const balancesBilan = {};
  const balancesResultat = {};
  const balancesResultatAnt = {};

  const addAmount = (balancesObj, compte, deb, cred, tx) => {
    if (!compte) return;
    const compteStr = String(compte).trim();
    if (!compteStr) return;
    
    if (!balancesObj[compteStr]) balancesObj[compteStr] = { debit: 0, credit: 0, txs: [] };
    balancesObj[compteStr].debit += (Number(deb) || 0);
    balancesObj[compteStr].credit += (Number(cred) || 0);
    if (tx) balancesObj[compteStr].txs.push(tx); 
  };

  const processTx = (t, isAnterieur) => {
    if (!t) return;
    const isOD = t.type === 'od';
    const resObj = isAnterieur ? balancesResultatAnt : balancesResultat;
    const m = Number(t.montant) || 0;
    const absM = Math.abs(m);

    if (isOD) {
      const dCode = t.compteDebit ? String(t.compteDebit).trim() : '';
      const cCode = t.compteCredit ? String(t.compteCredit).trim() : '';

      if (dCode) {
        if (dCode.startsWith('6') || dCode.startsWith('7')) addAmount(resObj, dCode, absM, 0, t);
        else addAmount(balancesBilan, dCode, absM, 0, t);
      }
      if (cCode) {
        if (cCode.startsWith('6') || cCode.startsWith('7')) addAmount(resObj, cCode, 0, absM, t);
        else addAmount(balancesBilan, cCode, 0, absM, t);
      }
    } else {
      const compteStr = t.compte ? String(t.compte).trim() : '';
      const isCharge = compteStr.startsWith('6');
      const isProduit = compteStr.startsWith('7');

      if (isCharge || isProduit) {
        if (m < 0) addAmount(resObj, compteStr, absM, 0, t);
        else addAmount(resObj, compteStr, 0, absM, t);
      } else if (compteStr) {
        if (m < 0) addAmount(balancesBilan, compteStr, absM, 0, t);
        else addAmount(balancesBilan, compteStr, 0, absM, t);
      }

      const txBanque = { ...t, libelle: `(Mouvement Bancaire) ${t.libelle}` };
      if (m < 0) addAmount(balancesBilan, '512000', 0, absM, txBanque); 
      else addAmount(balancesBilan, '512000', absM, 0, txBanque); 
    }
  };

  anterieures.forEach(t => processTx(t, true));
  exercice.forEach(t => processTx(t, false));

  let resultatAnterieur = 0;
  Object.keys(balancesResultatAnt).forEach(code => {
    const b = balancesResultatAnt[code];
    if (code.startsWith('7')) resultatAnterieur += (b.credit - b.debit);
    if (code.startsWith('6')) resultatAnterieur -= (b.debit - b.credit);
  });

  if (Math.abs(resultatAnterieur) > 0.01) {
    const txReport = { date: '-', libelle: "Report du résultat des exercices antérieurs", montant: resultatAnterieur };
    if (resultatAnterieur > 0) addAmount(balancesBilan, '120000', 0, Math.abs(resultatAnterieur), txReport); 
    else addAmount(balancesBilan, '120000', Math.abs(resultatAnterieur), 0, txReport); 
  }

  const groupes = {
    actifImmo: { label: "Actif Immobilisé", total: 0, sousGroupes: {} },
    actifCirc: { label: "Actif Circulant", total: 0, sousGroupes: {} },
    fondsPropres: { label: "Fonds Propres", total: 0, sousGroupes: {} },
    dettes: { label: "Dettes", total: 0, sousGroupes: {} },
    chExploitation: { label: "Charges d'Exploitation", total: 0, sousGroupes: {} },
    chFinancieres: { label: "Charges Financières", total: 0, sousGroupes: {} },
    chExceptionnelles: { label: "Charges Exceptionnelles", total: 0, sousGroupes: {} },
    prodExploitation: { label: "Produits d'Exploitation", total: 0, sousGroupes: {} },
    prodFinanciers: { label: "Produits Financiers", total: 0, sousGroupes: {} },
    prodExceptionnels: { label: "Produits Exceptionnels", total: 0, sousGroupes: {} }
  };

  const addToGroup = (categorieObj, code, val, txs) => {
    const prefix2 = code.substring(0, 2);
    const groupName = `${prefix2} - ${PREFIXES[prefix2] || 'Autres comptes'}`;
    if (!categorieObj.sousGroupes[groupName]) {
      categorieObj.sousGroupes[groupName] = { total: 0, items: [] };
    }
    categorieObj.sousGroupes[groupName].items.push({ code, libelle: getCompteLibelle(code), net: val, txs: txs || [] });
    categorieObj.sousGroupes[groupName].total += val;
    categorieObj.total += val;
  };

  Object.keys(balancesBilan).forEach(code => {
    if (!code || code.length < 2) return;
    const b = balancesBilan[code];
    const soldeDebit = b.debit - b.credit;
    const soldeCredit = b.credit - b.debit;
    
    if (Math.abs(soldeDebit) < 0.01) return;

    const root = code[0];
    const prefix2 = code.substring(0, 2);

    if (root === '1') {
      if (['15', '16'].includes(prefix2)) addToGroup(groupes.dettes, code, soldeCredit, b.txs);
      else addToGroup(groupes.fondsPropres, code, soldeCredit, b.txs); 
    } else if (root === '2') {
      addToGroup(groupes.actifImmo, code, soldeDebit, b.txs);
    } else if (['3', '4', '5'].includes(root)) {
      if (soldeDebit > 0) addToGroup(groupes.actifCirc, code, soldeDebit, b.txs);
      else addToGroup(groupes.dettes, code, soldeCredit, b.txs); 
    }
  });

  Object.keys(balancesResultat).forEach(code => {
    if (!code || code.length < 2) return;
    const b = balancesResultat[code];
    const soldeDebit = b.debit - b.credit;
    const soldeCredit = b.credit - b.debit;
    
    if (Math.abs(soldeDebit) < 0.01) return;

    const root = code[0];
    const prefix2 = code.substring(0, 2);

    if (root === '6') {
      if (prefix2 === '66') addToGroup(groupes.chFinancieres, code, soldeDebit, b.txs);
      else if (prefix2 === '67') addToGroup(groupes.chExceptionnelles, code, soldeDebit, b.txs);
      else addToGroup(groupes.chExploitation, code, soldeDebit, b.txs);
    } else if (root === '7') {
      if (prefix2 === '76') addToGroup(groupes.prodFinanciers, code, soldeCredit, b.txs);
      else if (prefix2 === '77') addToGroup(groupes.prodExceptionnels, code, soldeCredit, b.txs);
      else addToGroup(groupes.prodExploitation, code, soldeCredit, b.txs);
    }
  });

  Object.values(groupes).forEach(cat => {
    Object.values(cat.sousGroupes).forEach(sg => {
      sg.items.sort((a, b) => a.code.localeCompare(b.code));
    });
  });

  const sortedKeys = (obj) => Object.keys(obj).sort();

  const totalCharges = groupes.chExploitation.total + groupes.chFinancieres.total + groupes.chExceptionnelles.total;
  const totalProduits = groupes.prodExploitation.total + groupes.prodFinanciers.total + groupes.prodExceptionnels.total;
  const resultatExercice = totalProduits - totalCharges;

  if (Math.abs(resultatExercice) > 0.01) {
    const groupName = `12 - ${PREFIXES['12']}`;
    if (!groupes.fondsPropres.sousGroupes[groupName]) {
      groupes.fondsPropres.sousGroupes[groupName] = { total: 0, items: [] };
    }
    
    const existingItem = groupes.fondsPropres.sousGroupes[groupName].items.find(i => i.code === '120000');
    const txCalcul = { date: '-', libelle: 'Calcul mathématique du résultat', montant: resultatExercice };

    if (anneeDebut === 'TOTAL') {
      if (existingItem) {
        existingItem.net += resultatExercice;
        existingItem.libelle = 'Résultat Global (Cumulé)';
        existingItem.txs.push(txCalcul);
      } else {
        groupes.fondsPropres.sousGroupes[groupName].items.push({ code: '120000', libelle: 'Résultat Global (Cumulé)', net: resultatExercice, txs: [txCalcul] });
      }
    } else {
      groupes.fondsPropres.sousGroupes[groupName].items.push({ code: '120000', libelle: "Résultat de l'exercice (En cours)", net: resultatExercice, txs: [txCalcul] });
    }
    
    groupes.fondsPropres.sousGroupes[groupName].total += resultatExercice;
    groupes.fondsPropres.total += resultatExercice;
  }

  const totalActif = groupes.actifImmo.total + groupes.actifCirc.total;
  const totalPassif = groupes.fondsPropres.total + groupes.dettes.total;
  
  const ecartBilan = Math.abs(totalActif - totalPassif);
  const isBilanDesequilibre = ecartBilan > 0.01;

  const renderSousGroupes = (categorieObj) => {
    if (Object.keys(categorieObj.sousGroupes).length === 0) {
      return <div className="text-center text-slate-400 text-sm py-3 italic">Aucune donnée</div>;
    }
    return sortedKeys(categorieObj.sousGroupes).map(groupKey => {
      const grp = categorieObj.sousGroupes[groupKey];
      const isExpanded = detailsOuverts[groupKey];
      return (
        <div key={groupKey} className="border-b border-slate-100 last:border-0">
          <div 
            className="flex justify-between items-center p-2.5 hover:bg-slate-100 cursor-pointer transition-colors"
            onClick={() => toggleDetail(groupKey)}
          >
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />}
              <span className="text-xs font-semibold text-slate-700">{groupKey}</span>
            </div>
            <span className={`text-xs font-bold whitespace-nowrap ml-2 ${grp.total < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {formatMontant(grp.total)} €
            </span>
          </div>
          {isExpanded && (
            <div className="bg-white pb-2">
              {grp.items.map(item => (
                <div key={item.code} className="flex justify-between items-center px-8 py-1.5 hover:bg-slate-50 transition-colors relative group/item">
                  <div className="flex items-center gap-2 pr-2">
                    <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 shrink-0">{item.code}</span>
                    <span className="text-xs text-slate-500 truncate" title={item.libelle}>
                      {item.libelle || <span className="italic text-slate-300">Sans libellé</span>}
                    </span>
                  </div>
                  
                  <div className="relative flex items-center justify-end">
                    <span className={`text-[11px] font-medium shrink-0 cursor-help border-b border-dotted ${item.net < 0 ? 'text-rose-500 border-rose-300' : 'text-slate-500 border-slate-300'}`}>
                      {formatMontant(item.net)} €
                    </span>
                    
                    <div className="absolute right-0 top-6 hidden group-hover/item:flex flex-col z-50 bg-slate-800 text-white text-xs p-3 rounded-xl shadow-2xl w-80 max-h-64 border border-slate-700 cursor-default">
                      <div className="font-bold text-slate-300 border-b border-slate-600 pb-2 mb-2 flex justify-between shrink-0">
                         <span>Opérations (Compte {item.code})</span>
                         <span>{item.txs?.length || 0} op.</span>
                      </div>
                      <div className="overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                         {item.txs && [...item.txs].reverse().map((tx, idx) => (
                           <div key={idx} className="flex justify-between items-start gap-3 border-b border-slate-700/50 pb-1.5 last:border-0">
                             <div className="flex flex-col overflow-hidden">
                               <span className="text-slate-400 text-[9px] font-mono">{tx.date}</span>
                               <span className="text-slate-200 leading-tight truncate">{tx.libelle}</span>
                             </div>
                             <span className="font-mono font-bold whitespace-nowrap text-[10px] mt-0.5">{formatMontant(Math.abs(tx.montant))} €</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="text-indigo-600" /> États Financiers
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {anneeDebut === 'TOTAL' ? 'Bilan consolidé et Compte de Résultat de toutes les écritures.' : 'Bilan et Compte de Résultat structurés selon le PCG.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Calendar size={18} className="text-slate-500" />
          <select 
            value={anneeDebut} 
            onChange={(e) => setAnneeDebut(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="TOTAL" className="font-bold text-indigo-700">⭐ Bilan Total (Toutes années)</option>
            <option disabled>──────────────</option>
            {[2021, 2022, 2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>
                01/09/{String(year).slice(-2)} au 31/08/{String(year + 1).slice(-2)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {anneeDebut !== 'TOTAL' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="bg-slate-900 p-4 rounded-t-xl">
            <h3 className="text-white font-bold flex items-center gap-2 text-lg">
              Compte de Résultat (Classe 6 & 7)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* COLONNE CHARGES */}
            <div className="bg-slate-50/50">
              <div className="bg-red-50 text-red-700 font-bold p-3 text-center text-sm border-b border-red-100 uppercase tracking-wider flex justify-between px-4 shadow-sm z-10 relative">
                <span>Total des Charges</span>
                <span>{formatMontant(totalCharges)} €</span>
              </div>
              
              <div className="p-3 space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 border-b border-slate-200 pb-1 flex justify-between">
                    <span>Charges d'Exploitation</span>
                    <span className="text-slate-600">{formatMontant(groupes.chExploitation.total)} €</span>
                  </div>
                  {renderSousGroupes(groupes.chExploitation)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 border-b border-slate-200 pb-1 flex justify-between">
                    <span>Charges Financières</span>
                    <span className="text-slate-600">{formatMontant(groupes.chFinancieres.total)} €</span>
                  </div>
                  {renderSousGroupes(groupes.chFinancieres)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 border-b border-slate-200 pb-1 flex justify-between">
                    <span>Charges Exceptionnelles</span>
                    <span className="text-slate-600">{formatMontant(groupes.chExceptionnelles.total)} €</span>
                  </div>
                  {renderSousGroupes(groupes.chExceptionnelles)}
                </div>
              </div>
            </div>

            {/* COLONNE PRODUITS */}
            <div className="bg-slate-50/50">
              <div className="bg-emerald-50 text-emerald-700 font-bold p-3 text-center text-sm border-b border-emerald-100 uppercase tracking-wider flex justify-between px-4 shadow-sm z-10 relative">
                <span>Total des Produits</span>
                <span>{formatMontant(totalProduits)} €</span>
              </div>
              
              <div className="p-3 space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 border-b border-slate-200 pb-1 flex justify-between">
                    <span>Produits d'Exploitation</span>
                    <span className="text-slate-600">{formatMontant(groupes.prodExploitation.total)} €</span>
                  </div>
                  {renderSousGroupes(groupes.prodExploitation)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 border-b border-slate-200 pb-1 flex justify-between">
                    <span>Produits Financiers</span>
                    <span className="text-slate-600">{formatMontant(groupes.prodFinanciers.total)} €</span>
                  </div>
                  {renderSousGroupes(groupes.prodFinanciers)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 border-b border-slate-200 pb-1 flex justify-between">
                    <span>Produits Exceptionnels</span>
                    <span className="text-slate-600">{formatMontant(groupes.prodExceptionnels.total)} €</span>
                  </div>
                  {renderSousGroupes(groupes.prodExceptionnels)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-between items-center rounded-b-xl">
            <span className="font-bold text-slate-700 uppercase">Résultat de l'exercice</span>
            <span className={`text-xl font-black ${resultatExercice >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {resultatExercice > 0 ? '+' : ''}{formatMontant(resultatExercice)} €
            </span>
          </div>
        </div>
      )}

      {isBilanDesequilibre && (
        <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start gap-4 animate-pulse">
          <div className="p-3 bg-rose-500 text-white rounded-xl shadow-md shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="font-black text-rose-900 text-lg uppercase tracking-tight">Déséquilibre du Bilan Détecté</h4>
            <p className="text-sm text-rose-800 mt-1 leading-relaxed">
              En comptabilité, l'Actif doit toujours être égal au Passif (qui inclut le Résultat). 
              Écart actuel : <strong className="bg-rose-200 px-1.5 py-0.5 rounded">{formatMontant(ecartBilan)} €</strong>.
            </p>
          </div>
        </div>
      )}

      {!isBilanDesequilibre && safeTransactions.length > 0 && anneeDebut === 'TOTAL' && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-md shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-sm text-emerald-800 font-medium">
            Excellente nouvelle ! Votre Bilan Total est <strong>parfaitement équilibré</strong> au centime près. L'Actif correspond exactement au Passif.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="bg-slate-900 p-4 rounded-t-xl">
          <h3 className="text-white font-bold flex items-center gap-2 text-lg">
            Bilan Comptable (Classe 1 à 5)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* COLONNE ACTIF */}
          <div className="bg-slate-50/50">
            <div className="bg-blue-50 text-blue-700 font-bold p-3 text-center text-sm border-b border-blue-100 uppercase tracking-wider flex justify-between px-4 shadow-sm z-10 relative">
              <span>Total Actif (Emplois)</span>
              <span>{formatMontant(totalActif)} €</span>
            </div>
            <div className="p-3 space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 border-b border-slate-200 pb-1 flex justify-between">
                  <span>Actif Immobilisé</span>
                  <span className="text-slate-600">{formatMontant(groupes.actifImmo.total)} €</span>
                </div>
                {renderSousGroupes(groupes.actifImmo)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 border-b border-slate-200 pb-1 flex justify-between">
                  <span>Actif Circulant</span>
                  <span className="text-slate-600">{formatMontant(groupes.actifCirc.total)} €</span>
                </div>
                {renderSousGroupes(groupes.actifCirc)}
              </div>
            </div>
          </div>

          {/* COLONNE PASSIF */}
          <div className="bg-slate-50/50">
            <div className="bg-orange-50 text-orange-700 font-bold p-3 text-center text-sm border-b border-orange-100 uppercase tracking-wider flex justify-between px-4 shadow-sm z-10 relative">
              <span>Total Passif (Ressources)</span>
              <span>{formatMontant(totalPassif)} €</span>
            </div>
            <div className="p-3 space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 border-b border-slate-200 pb-1 flex justify-between">
                  <span>Fonds Propres</span>
                  <span className="text-slate-600">{formatMontant(groupes.fondsPropres.total)} €</span>
                </div>
                {renderSousGroupes(groupes.fondsPropres)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 border-b border-slate-200 pb-1 flex justify-between">
                  <span>Dettes</span>
                  <span className="text-slate-600">{formatMontant(groupes.dettes.total)} €</span>
                </div>
                {renderSousGroupes(groupes.dettes)}
              </div>
            </div>
          </div>

        </div>

        <div className={`p-4 border-t flex justify-between items-center text-sm rounded-b-xl ${isBilanDesequilibre ? 'bg-rose-100 border-rose-300' : 'bg-slate-100 border-slate-200'}`}>
          <span className={`font-black uppercase ${isBilanDesequilibre ? 'text-rose-700' : 'text-slate-500'}`}>ÉQUILIBRE DU BILAN</span>
          <div className="flex gap-8">
            <span className="font-bold text-blue-700">Actif : {formatMontant(totalActif)} €</span>
            <span className="font-bold text-orange-700">Passif : {formatMontant(totalPassif)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- GRAND LIVRE (Import CSV/XLSX, OD, Validations) ---
const GrandLivre = ({ transactionsGlobales }) => {
  const [lignesEnAttente, setLignesEnAttente] = useState([]);
  const [comptesList, setComptesList] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [lastImportBatch, setLastImportBatch] = useState(null);

  const [selectedTxForPdf, setSelectedTxForPdf] = useState(null);
  const fileInputPdfRef = useRef(null);

  const [showCompteModal, setShowCompteModal] = useState(false);
  const [pendingCompte, setPendingCompte] = useState({ code: '', libelle: '', lineId: null });

  const [activeTab, setActiveTab] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetAnnee, setResetAnnee] = useState('TOTAL');

  const [odFormDate, setOdFormDate] = useState('');
  const [odFormLibelle, setOdFormLibelle] = useState('');
  const [odFormCommentaire, setOdFormCommentaire] = useState('');
  const [odLines, setOdLines] = useState([
    { id: 1, compte: '', debit: '', credit: '' },
    { id: 2, compte: '', debit: '', credit: '' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompteFilter, setSelectedCompteFilter] = useState(''); 
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('');
  const [anneeFiltre, setAnneeFiltre] = useState('TOTAL');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const fileInputBankRef = useRef(null);
  const fileInputPaieRef = useRef(null);
  const fileInputODRef = useRef(null);

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'comptes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste = [];
      snapshot.forEach((doc) => {
        liste.push({ id: doc.id, ...doc.data() });
      });
      liste.sort((a, b) => a.code.localeCompare(b.code));
      setComptesList(liste);
    });
    return () => unsubscribe();
  }, []);

  const getClasseLabel = (code) => {
    if (!code) return '';
    const root = code[0];
    const map = {
      '1': 'Classe 1 — Capitaux & Fonds propres',
      '2': 'Classe 2 — Immobilisations',
      '3': 'Classe 3 — Stocks',
      '4': 'Classe 4 — Tiers (Usagers, Fournisseurs, Personnel)',
      '5': 'Classe 5 — Trésorerie & Banques',
      '6': 'Classe 6 — Charges (Dépenses)',
      '7': 'Classe 7 — Produits (Recettes)'
    };
    return map[root] || 'Compte Général';
  };

  const parseDateForSort = (dStr) => {
    if (!dStr) return 0;
    const str = String(dStr).trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        return new Date(year, month, day).getTime();
      }
    } else if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
      }
    }
    return new Date(str).getTime() || 0;
  };

  const handleCompteOdBlur = (lineId, rawCode) => {
    if (!rawCode) return;
    const cleanCode = String(rawCode).trim().replace(/[^0-9]/g, '');

    if (cleanCode.length >= 6) {
      const exists = comptesList.some(c => c.code === cleanCode);
      if (!exists) {
        setPendingCompte({ code: cleanCode, libelle: '', lineId });
        setShowCompteModal(true);
      } else {
        setOdLines(prev => prev.map(l => l.id === lineId ? { ...l, compte: cleanCode } : l));
      }
    }
  };

  const handleSaveNewCompteFromModal = async () => {
    if (!pendingCompte.code || pendingCompte.code.length < 6) {
      alert("Le numéro de compte doit contenir au moins 6 chiffres.");
      return;
    }
    if (!pendingCompte.libelle.trim()) {
      alert("Veuillez saisir un libellé pour ce compte.");
      return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'comptes'), {
        code: pendingCompte.code,
        libelle: pendingCompte.libelle.trim()
      });

      if (pendingCompte.lineId) {
        setOdLines(prev => prev.map(l => l.id === pendingCompte.lineId ? { ...l, compte: pendingCompte.code } : l));
      }

      setShowCompteModal(false);
      setPendingCompte({ code: '', libelle: '', lineId: null });
    } catch (e) {
      alert("Erreur lors de la création du compte.");
    }
  };

  const handleTriggerPdf = (txId) => {
    setSelectedTxForPdf(txId);
    if (fileInputPdfRef.current) fileInputPdfRef.current.click();
  };

  const handlePdfChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedTxForPdf) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (maximum 3 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', selectedTxForPdf), {
          pdfData: base64Data,
          pdfName: file.name
        });
      } catch (err) {
        alert("Erreur lors de l'enregistrement du document.");
      }
      setSelectedTxForPdf(null);
      if (fileInputPdfRef.current) fileInputPdfRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleResetPartiel = async (sourceToDelete) => {
    const txToDelete = transactionsGlobales.filter(tx => {
      let matchSource = false;
      if (sourceToDelete === 'tout') {
        matchSource = true;
      } else {
        let source = 'banque';
        if (tx.type === 'od') {
          if (tx.typeOp === 'PAIE' || (tx.libelle && String(tx.libelle).includes('(PAIE)'))) source = 'paie';
          else if (tx.typeOp === 'NDF' || (tx.libelle && String(tx.libelle).includes('(NDF)'))) source = 'ndf';
          else source = 'od';
        }
        matchSource = (source === sourceToDelete);
      }

      let matchPeriod = true;
      if (resetAnnee !== 'TOTAL') {
        const start = new Date(Number(resetAnnee), 8, 1, 0, 0, 0).getTime();
        const end = new Date(Number(resetAnnee) + 1, 7, 31, 23, 59, 59).getTime();
        if (!tx.date) {
          matchPeriod = false;
        } else {
          const tTime = parseDateForSort(tx.date);
          matchPeriod = (tTime >= start && tTime <= end);
        }
      }

      return matchSource && matchPeriod;
    });

    if (txToDelete.length === 0) {
      alert("Aucune écriture validée trouvée pour cette source et cette période.");
      return;
    }

    const nomsSources = {
      'banque': 'du Journal de Banque',
      'paie': 'des Fiches de Paie',
      'od': 'des Opérations Diverses',
      'ndf': 'des Notes de Frais',
      'tout': 'de toutes les sources'
    };

    const nomPeriode = resetAnnee === 'TOTAL' ? 'sur toutes les années' : `sur l'exercice ${resetAnnee}-${Number(resetAnnee) + 1}`;

    const pwd = window.prompt(`⚠️ DANGER : Vous allez supprimer définitivement ${txToDelete.length} écriture(s) provenant ${nomsSources[sourceToDelete]} ${nomPeriode}.\n\nVeuillez entrer le mot de passe administrateur pour confirmer :`);

    if (pwd === 'admin123') {
      const confirm = window.confirm(`Êtes-vous absolument sûr ?\nCeci effacera ${txToDelete.length} écritures de façon irréversible.`);
      if (confirm) {
        setShowResetModal(false);
        try {
          let count = 0;
          for (const tx of txToDelete) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', tx.id));
            count++;
          }
          alert(`Succès : ${count} écriture(s) effacée(s).`);
        } catch (e) {
          alert("Erreur lors de la suppression.");
        }
      }
    } else if (pwd !== null) {
      alert("Mot de passe incorrect. Annulation.");
    }
  };

  const devinerCompte = (libelleTxt) => {
    if (!libelleTxt) return '';
    const txt = String(libelleTxt).toLowerCase();

    const memoire = transactionsGlobales.find(tx => 
      tx.compte && tx.type !== 'od' && tx.libelle && (txt.includes(String(tx.libelle).toLowerCase()) || String(tx.libelle).toLowerCase().includes(txt))
    );
    let guess = memoire ? memoire.compte : '';

    if (!guess) {
      const dictionnaire = [
        { mots: ['edf', 'engie', 'eau', 'electricite', 'saur'], compte: '606100' }, 
        { mots: ['loyer', 'sci '], compte: '613200' }, 
        { mots: ['orange', 'sfr', 'bouygues', 'free', 'telephone', 'internet', 'ovh', 'vercel'], compte: '626000' }, 
        { mots: ['banque', 'agios', 'cotisation', 'commission', 'frais bancaires', 'credit agricole', 'caisse epargne'], compte: '627000' }, 
        { mots: ['assurance', 'macif', 'axa', 'maaf', 'mgen'], compte: '616000' }, 
        { mots: ['dgfip', 'impot', 'urssaf', 'tresor public'], compte: '635000' }, 
        { mots: ['salaire', 'virement salaire', 'paie'], compte: '421000' }, 
        { mots: ['fourniture', 'bureau vallée', 'fnac', 'amazon', 'papeterie', 'leclerc', 'carrefour'], compte: '606400' }, 
        { mots: ['nettoyage', 'menage', 'entretien'], compte: '611000' }, 
        { mots: ['scolarite', 'frais de scolarite', 'ecolage', 'famille', 'inscription'], compte: '706000' }, 
        { mots: ['don ', 'helloasso', 'mecenat'], compte: '754000' }, 
      ];

      for (let regle of dictionnaire) {
        if (regle.mots.some(mot => txt.includes(mot))) {
          guess = regle.compte;
          break;
        }
      }
    }

    if (guess && comptesList.some(c => c.code === guess)) {
      return guess;
    }
    return '';
  };

  useEffect(() => {
    if (lignesEnAttente.length > 0) {
      setLignesEnAttente(prev => prev.map(ligne => {
        if (!ligne.comptePropose && !ligne.modifieManuellement) {
          const guess = devinerCompte(ligne.libelle);
          if (guess) return { ...ligne, comptePropose: guess };
        }
        return ligne;
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionsGlobales, comptesList]);

  const parseMontant = (rawVal) => {
    if (rawVal === undefined || rawVal === null || rawVal === '') return 0;
    if (typeof rawVal === 'number') return rawVal;
    let s = String(rawVal).replace(/[\s\u00A0\u202F]/g, '');
    if (s.includes(',') && s.includes('.')) {
      if (s.indexOf(',') < s.indexOf('.')) {
        s = s.replace(/,/g, '');
      } else {
        s = s.replace(/\./g, '').replace(',', '.');
      }
    } else if (s.includes(',')) {
      s = s.replace(/,/g, '.');
    }
    return parseFloat(s) || 0;
  };

  const handleUndoLastImport = async () => {
    if (!lastImportBatch) return;
    if (!window.confirm(`Voulez-vous vraiment annuler le dernier import de ${lastImportBatch.source} (${lastImportBatch.count} lignes) ?`)) return;

    if (lastImportBatch.target === 'sas') {
      setLignesEnAttente(prev => prev.filter(l => l.batchId !== lastImportBatch.batchId));
      alert("L'import a été annulé et retiré de la liste d'attente.");
    } else if (lastImportBatch.target === 'firestore') {
      const txToDelete = transactionsGlobales.filter(t => t.batchId === lastImportBatch.batchId);
      for (const tx of txToDelete) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', tx.id));
      }
      alert(`L'import a été annulé (${txToDelete.length} écritures ont été retirées du Grand Livre).`);
    }
    setLastImportBatch(null);
  };

  const handleImportBank = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const batchId = 'batch_' + Date.now();
    let doublonsCount = 0;

    const processRows = (lignesBrutes) => {
      const nouvellesLignes = [];
      for (let i = 0; i < lignesBrutes.length; i++) {
        const cols = lignesBrutes[i];
        if (cols.length >= 6) {
          const debit = parseMontant(cols[5]);
          const credit = parseMontant(cols[6]);
          let mt = 0;
          if (cols[6] !== undefined && cols[6] !== '') {
            mt = credit !== 0 ? Math.abs(credit) : -Math.abs(debit);
          } else {
            mt = debit;
          }

          const dateExtrait = normaliserDateFR(cols[0]);
          const libelleExtrait = cols[1] ? String(cols[1]) : (cols[3] ? String(cols[3]) : '');

          if (mt !== 0) {
            const isDuplicate = transactionsGlobales.some(t => t.date === dateExtrait && t.libelle === libelleExtrait && Math.abs(t.montant) === Math.abs(mt)) ||
                                lignesEnAttente.some(t => t.date === dateExtrait && t.libelle === libelleExtrait && Math.abs(t.montant) === Math.abs(mt));

            if (isDuplicate) {
              doublonsCount++;
              continue; 
            }

            nouvellesLignes.push({
              id: Math.random().toString(36).substr(2, 9),
              batchId: batchId,
              date: dateExtrait,
              libelle: libelleExtrait,
              reference: cols[2] ? String(cols[2]) : '', 
              typeOp: cols[4] ? String(cols[4]) : '',
              commentaire: '',
              montant: mt,
              comptePropose: devinerCompte(libelleExtrait),
              statut: 'attente'
            });
          }
        }
      }
      return nouvellesLignes;
    };

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const lines = event.target.result.split('\n');
        const lignesBrutes = lines.slice(1).map(line => line.split(';').map(c => c.trim().replace(/"/g, '')));
        const resultat = processRows(lignesBrutes);
        setLignesEnAttente(prev => [...prev, ...resultat]);
        if (resultat.length > 0) setLastImportBatch({ batchId, target: 'sas', source: 'Journal de Banque', count: resultat.length });
        alert(`${resultat.length} ligne(s) importée(s) avec succès.${doublonsCount > 0 ? `\n(Sécurité : ${doublonsCount} doublon(s) existant(s) ignoré(s))` : ''}`);
      };
      reader.readAsText(file, 'ISO-8859-1');
    } else if (ext === 'xlsx') {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: '' });
        const resultat = processRows(rows.slice(1));
        setLignesEnAttente(prev => [...prev, ...resultat]);
        if (resultat.length > 0) setLastImportBatch({ batchId, target: 'sas', source: 'Journal de Banque', count: resultat.length });
        alert(`${resultat.length} ligne(s) importée(s) avec succès.${doublonsCount > 0 ? `\n(Sécurité : ${doublonsCount} doublon(s) existant(s) ignoré(s))` : ''}`);
      } catch (err) {
        console.error("Détail de l'erreur Excel :", err);
        alert("Erreur lors de la lecture du fichier XLSX. Détails dans la console (touche F12).");
      }
    }
    if (fileInputBankRef.current) fileInputBankRef.current.value = '';
    setActiveTab(null);
  };

  const handleImportPaie = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const batchId = 'batch_' + Date.now();

    const reader = new FileReader();
    reader.onload = async (event) => {
      const lines = event.target.result.split('\n');
      let count = 0;
      let doublonsCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split('\t');
        if (cols.length >= 13) {
          const rawDate = cols[3].trim();
          const formattedDate = normaliserDateFR(rawDate);
          const compteNum = cols[4] ? String(cols[4]).trim() : '';
          const compteLib = cols[5] ? String(cols[5]).trim() : '';
          const pieceRef = cols[8] ? String(cols[8]).trim() : '';
          const ecritureLib = cols[10] ? String(cols[10]).trim() : '';
          const debit = parseMontant(cols[11]);
          const credit = parseMontant(cols[12]);

          if (debit > 0 || credit > 0) {
            const libelleFinal = `(PAIE) ${ecritureLib} - ${compteLib}`;
            const mt = debit > 0 ? debit : credit;

            const isDuplicate = transactionsGlobales.some(t => t.date === formattedDate && t.libelle === libelleFinal && Math.abs(t.montant) === Math.abs(mt));

            if (isDuplicate) {
              doublonsCount++;
              continue;
            }

            const newTx = {
              batchId: batchId, 
              date: formattedDate,
              libelle: libelleFinal,
              montant: mt,
              type: 'od',
              compteDebit: debit > 0 ? compteNum : '',
              compteCredit: credit > 0 ? compteNum : '',
              reference: pieceRef,
              typeOp: 'Paie',
              commentaire: '',
              date_creation: new Date().toISOString()
            };

            try {
              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newTx);
              count++;
            } catch(err) {
              console.error(err);
            }
          }
        }
      }
      if (count > 0) setLastImportBatch({ batchId, target: 'firestore', source: 'Fiches de Paie', count });
      alert(`${count} ligne(s) de paie intégrée(s) !${doublonsCount > 0 ? `\n(Sécurité : ${doublonsCount} doublon(s) existant(s) ignoré(s))` : ''}`);
      if (fileInputPaieRef.current) fileInputPaieRef.current.value = '';
      setActiveTab(null);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImportODMass = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const batchId = 'batch_' + Date.now();

    const processRows = async (rows) => {
      let count = 0;
      let doublonsCount = 0; 
      const transactionsToInsert = []; 
      
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols && cols.length >= 9) {
          const rawDate = cols[0];
          const journal = String(cols[2] || '').trim().toUpperCase();
          const compteNum = String(cols[3] || '').trim();
          const pieceRef = cols[5] ? String(cols[5]) : '';
          const libelle = cols[6] ? String(cols[6]) : '';

          let debitVal = parseMontant(cols[7]);
          let creditVal = parseMontant(cols[8]);
          const commentaire = cols[11] ? String(cols[11]) : '';

          if (debitVal < 0) {
            creditVal = Math.abs(debitVal);
            debitVal = 0;
          } else if (creditVal < 0) {
            debitVal = Math.abs(creditVal);
            creditVal = 0;
          }

          if (rawDate && libelle && (debitVal !== 0 || creditVal !== 0)) {
            const formattedDate = normaliserDateFR(rawDate);
            const isDebit = debitVal > 0;
            const montantFinal = isDebit ? debitVal : creditVal;
            const prefix = journal === 'PAIE' ? '(PAIE)' : '(OD)';
            const libelleFinal = `${prefix} ${libelle}`;

            const isDuplicate = transactionsGlobales.some(t => 
              t.date === formattedDate && 
              t.libelle === libelleFinal && 
              Math.abs(t.montant) === Math.abs(montantFinal)
            );

            if (isDuplicate) {
              doublonsCount++;
              continue; 
            }

            const newTx = {
              batchId: batchId,
              date: formattedDate,
              libelle: libelleFinal,
              montant: montantFinal,
              type: 'od',
              compteDebit: isDebit ? compteNum : '',
              compteCredit: !isDebit ? compteNum : '',
              reference: pieceRef,
              typeOp: journal || 'OD', 
              commentaire: commentaire,
              date_creation: new Date().toISOString()
            };

            transactionsToInsert.push(newTx); 
          }
        }
      }

      const chunkSize = 100;
      for (let i = 0; i < transactionsToInsert.length; i += chunkSize) {
        const chunk = transactionsToInsert.slice(i, i + chunkSize);
        const promises = chunk.map(tx => addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), tx));
        await Promise.all(promises); 
        count += chunk.length;
      }

      if (count > 0) setLastImportBatch({ batchId, target: 'firestore', source: 'Opérations Diverses', count });
      
      alert(`${count} lignes importées avec succès dans le Grand Livre !${doublonsCount > 0 ? `\n(Sécurité : ${doublonsCount} doublon(s) ignoré(s))` : ''}`);
      
      if (fileInputODRef.current) fileInputODRef.current.value = '';
      setActiveTab(null);
    };

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const lines = event.target.result.split('\n');
        const rows = lines.map(line => line.split(';').map(c => c.trim().replace(/"/g, '')));
        await processRows(rows);
      };
      reader.readAsText(file, 'ISO-8859-1');
    } else if (ext === 'xlsx') {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: true, defval: '' });
        await processRows(rows);
      } catch (err) {
        console.error(err);
        alert("Erreur de lecture du fichier XLSX.");
      }
    }
  };

  const validerLigneBank = async (ligneId, compteCode, commentaireTxt) => {
    const ligne = lignesEnAttente.find(l => l.id === ligneId);
    if (!ligne || !compteCode) {
      alert("Veuillez sélectionner un compte avant de valider.");
      return;
    }

    const newTx = {
      date: normaliserDateFR(ligne.date),
      libelle: ligne.libelle,
      montant: ligne.montant,
      compte: compteCode,
      reference: ligne.reference || '',
      typeOp: ligne.typeOp || '',
      commentaire: commentaireTxt || '',
      type: ligne.montant < 0 ? 'depense' : 'recette',
      date_creation: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newTx);
      setLignesEnAttente(prev => prev.filter(l => l.id !== ligneId));
    } catch(e) {
      alert("Erreur de sauvegarde.");
    }
  };

  const addOdLine = () => setOdLines([...odLines, { id: Date.now(), compte: '', debit: '', credit: '' }]);
  const removeOdLine = (id) => setOdLines(odLines.filter(l => l.id !== id));

  const updateOdLine = (id, field, value) => {
    setOdLines(odLines.map(l => {
      if (l.id === id) {
        const updatedLine = { ...l, [field]: value };
        if (field === 'debit' && value !== '') updatedLine.credit = '';
        if (field === 'credit' && value !== '') updatedLine.debit = '';
        return updatedLine;
      }
      return l;
    }));
  };

  const totalDebitOD = odLines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCreditOD = odLines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isOdBalanced = Math.abs(totalDebitOD - totalCreditOD) < 0.01 && totalDebitOD > 0;

  const handleAddOD = async () => {
    if (!odFormDate || !odFormLibelle) return alert('Date et libellé requis.');
    if (!isOdBalanced) return alert("L'OD doit être équilibrée (Total Débit = Total Crédit) et supérieure à 0.");

    for (const line of odLines) {
      const debit = parseFloat(line.debit) || 0;
      const credit = parseFloat(line.credit) || 0;
      if (!line.compte && (debit > 0 || credit > 0)) {
         return alert('Veuillez sélectionner un compte pour chaque ligne où vous avez saisi un montant.');
      }
    }

    try {
      const dateFormatted = normaliserDateFR(odFormDate);
      for (const line of odLines) {
        const debit = parseFloat(line.debit) || 0;
        const credit = parseFloat(line.credit) || 0;
        if (debit > 0 || credit > 0) {
          const newTx = {
            date: dateFormatted,
            libelle: `(OD) ${odFormLibelle}`,
            montant: debit > 0 ? debit : credit,
            type: 'od',
            compteDebit: debit > 0 ? line.compte : '',
            compteCredit: credit > 0 ? line.compte : '',
            typeOp: 'OD',
            commentaire: odFormCommentaire,
            date_creation: new Date().toISOString()
          };
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newTx);
        }
      }
      setOdFormDate('');
      setOdFormLibelle('');
      setOdFormCommentaire('');
      setOdLines([{ id: 1, compte: '', debit: '', credit: '' }, { id: 2, compte: '', debit: '', credit: '' }]);
      alert("OD enregistrée et ventilée avec succès !");
      setActiveTab(null);
    } catch(e) {
      alert("Erreur lors de la création de l'OD.");
    }
  };

  const handleDeleteValidated = async (txId) => {
    if (confirmDeleteId === txId) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', txId));
        setConfirmDeleteId(null);
      } catch(e) { 
        alert('Erreur lors de la suppression.'); 
      }
    } else {
      setConfirmDeleteId(txId);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const handleUpdateField = async (txId, newValue, field) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', txId), {
        [field]: newValue
      });
    } catch(e) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactionsGlobales];

    if (anneeFiltre !== 'TOTAL') {
      const start = new Date(Number(anneeFiltre), 8, 1, 0, 0, 0).getTime(); 
      const end = new Date(Number(anneeFiltre) + 1, 7, 31, 23, 59, 59).getTime(); 
      
      result = result.filter(t => {
        if (!t.date) return false;
        const tTime = parseDateForSort(t.date);
        return tTime >= start && tTime <= end;
      });
    }

    if (selectedSourceFilter) {
      result = result.filter(t => {
        let source = 'banque';
        if (t.type === 'od') {
          if (t.typeOp === 'PAIE' || (t.libelle && String(t.libelle).includes('(PAIE)'))) source = 'paie';
          else if (t.typeOp === 'NDF' || (t.libelle && String(t.libelle).includes('(NDF)'))) source = 'ndf';
          else source = 'od';
        }
        return source === selectedSourceFilter;
      });
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(t => 
        (t.libelle && String(t.libelle).toLowerCase().includes(lowerTerm)) ||
        (t.compte && String(t.compte).toLowerCase().includes(lowerTerm)) ||
        (t.compteDebit && String(t.compteDebit).toLowerCase().includes(lowerTerm)) ||
        (t.compteCredit && String(t.compteCredit).toLowerCase().includes(lowerTerm)) ||
        (t.reference && String(t.reference).toLowerCase().includes(lowerTerm)) ||
        (t.commentaire && String(t.commentaire).toLowerCase().includes(lowerTerm))
      );
    }

    if (selectedCompteFilter) {
      result = result.filter(t => 
        t.compte === selectedCompteFilter || 
        t.compteDebit === selectedCompteFilter || 
        t.compteCredit === selectedCompteFilter
      );
    }

    result.sort((a, b) => {
      let valA, valB;

      if (sortConfig.key === 'source') {
        const getSource = (tx) => tx.type === 'od' ? (tx.typeOp === 'PAIE' || (tx.libelle && String(tx.libelle).includes('(PAIE)')) ? 'paie' : 'od') : 'banque';
        valA = getSource(a);
        valB = getSource(b);
      } else if (sortConfig.key === 'date') {
        valA = parseDateForSort(a.date);
        valB = parseDateForSort(b.date);
      } else if (sortConfig.key === 'debit') {
        valA = a.type === 'od' ? (a.compteDebit ? Number(a.montant) || 0 : 0) : (Number(a.montant) < 0 ? Math.abs(Number(a.montant)) : 0);
        valB = b.type === 'od' ? (b.compteDebit ? Number(b.montant) || 0 : 0) : (Number(b.montant) < 0 ? Math.abs(Number(b.montant)) : 0);
      } else if (sortConfig.key === 'credit') {
        valA = a.type === 'od' ? (a.compteCredit ? Number(a.montant) || 0 : 0) : (Number(a.montant) > 0 ? Number(a.montant) : 0);
        valB = b.type === 'od' ? (b.compteCredit ? Number(b.montant) || 0 : 0) : (Number(b.montant) > 0 ? Number(b.montant) : 0);
      } else if (sortConfig.key === 'compte') {
        valA = String(a.compte || a.compteDebit || a.compteCredit || '');
        valB = String(b.compte || b.compteDebit || b.compteCredit || '');
      } else {
        valA = String(a[sortConfig.key] || '').toLowerCase();
        valB = String(b[sortConfig.key] || '').toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactionsGlobales, searchTerm, selectedCompteFilter, sortConfig, anneeFiltre, selectedSourceFilter]);

  const formatMontantTableau = (montant) => {
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(montant || 0);
  };

  const nbLignesPretes = lignesEnAttente.filter(l => l.comptePropose).length;

  const totalGeneralDebit = filteredAndSortedTransactions.reduce((acc, t) => {
    if (t.type === 'od') return acc + (t.compteDebit ? Number(t.montant) || 0 : 0);
    return acc + (Number(t.montant) < 0 ? Math.abs(Number(t.montant)) : 0);
  }, 0);

  const totalGeneralCredit = filteredAndSortedTransactions.reduce((acc, t) => {
    if (t.type === 'od') return acc + (t.compteCredit ? Number(t.montant) || 0 : 0);
    return acc + (Number(t.montant) > 0 ? Number(t.montant) : 0);
  }, 0);

  const handleExportCSV = () => {
    if (filteredAndSortedTransactions.length === 0) {
      alert("Aucune écriture à exporter.");
      return;
    }

    const headers = ["Date", "ID", "Source", "Libellé", "Référence", "Type Op.", "Commentaire", "Débit", "Crédit", "Compte"];

    const rows = filteredAndSortedTransactions.map(t => {
      let source = 'Banque';
      if (t.type === 'od') {
        if (t.typeOp === 'PAIE' || (t.libelle && String(t.libelle).includes('(PAIE)'))) source = 'Paie';
        else if (t.typeOp === 'NDF' || (t.libelle && String(t.libelle).includes('(NDF)'))) source = 'NDF';
        else source = 'OD';
      }
      
      let debit = '';
      let credit = '';
      if (t.type === 'od') {
        debit = t.compteDebit ? Math.abs(t.montant) : '';
        credit = t.compteCredit ? Math.abs(t.montant) : '';
      } else {
        debit = t.montant < 0 ? Math.abs(t.montant) : '';
        credit = t.montant > 0 ? Math.abs(t.montant) : '';
      }

      const compte = t.compte || t.compteDebit || t.compteCredit || '';

      return [
        normaliserDateFR(t.date),
        t.id,
        source,
        `"${String(t.libelle || '').replace(/"/g, '""')}"`,
        `"${String(t.reference || '').replace(/"/g, '""')}"`,
        t.typeOp || '',
        `"${String(t.commentaire || '').replace(/"/g, '""')}"`,
        debit,
        credit,
        compte
      ].join(';');
    });

    const csvContent = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `Export_Grand_Livre_${anneeFiltre}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto px-3 py-2 font-sans">

      {/* INPUTS CACHÉS */}
      <input type="file" accept="application/pdf,image/*" className="hidden" ref={fileInputPdfRef} onChange={handlePdfChange} />
      <input type="file" accept=".csv,.xlsx" className="hidden" ref={fileInputBankRef} onChange={handleImportBank} />
      <input type="file" accept=".txt,.tsv" className="hidden" ref={fileInputPaieRef} onChange={handleImportPaie} />
      <input type="file" accept=".csv,.xlsx" className="hidden" ref={fileInputODRef} onChange={handleImportODMass} />

      {/* MODAL CRÉATION DE COMPTE */}
      {showCompteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-md overflow-hidden transition-all scale-100">
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl">
                  <Sparkles size={22} className="text-purple-200" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Nouveau compte comptable</h3>
                  <p className="text-purple-200 text-xs mt-0.5">Création automatique dans le Plan Comptable</p>
                </div>
              </div>
              <button onClick={() => setShowCompteModal(false)} className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Classification PCG</span>
                <span className="text-xs font-extrabold text-purple-900 bg-purple-200/70 px-3 py-1 rounded-lg">
                  {getClasseLabel(pendingCompte.code)}
                </span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Code Compte (6 chiffres min.)</label>
                <input type="text" value={pendingCompte.code} onChange={e => setPendingCompte({ ...pendingCompte, code: e.target.value.replace(/[^0-9]/g, '') })} className="w-full border border-slate-200 rounded-2xl p-3 text-base font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50" placeholder="ex: 618500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Libellé officiel</label>
                <input type="text" value={pendingCompte.libelle} onChange={e => setPendingCompte({ ...pendingCompte, libelle: e.target.value })} placeholder="ex: Abonnements Logiciels & SaaS" className="w-full border border-slate-200 rounded-2xl p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-600" autoFocus onKeyDown={e => { if(e.key === 'Enter') handleSaveNewCompteFromModal(); }} />
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowCompteModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors">Annuler</button>
              <button onClick={handleSaveNewCompteFromModal} disabled={pendingCompte.code.length < 6 || !pendingCompte.libelle.trim()} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 ${pendingCompte.code.length >= 6 && pendingCompte.libelle.trim() ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-200 cursor-pointer' : 'bg-purple-300 cursor-not-allowed shadow-none'}`}>
                <CheckCircle2 size={16} /> Créer & Affecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION SÉLECTIVE DU GRAND LIVRE */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-md overflow-hidden transition-all scale-100">
            <div className="bg-gradient-to-r from-rose-600 to-rose-800 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl">
                  <Trash2 size={22} className="text-rose-100" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Vider le Grand Livre</h3>
                  <p className="text-rose-200 text-xs mt-0.5">Purge sélective et sécurisée</p>
                </div>
              </div>
              <button onClick={() => setShowResetModal(false)} className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Choisir la période</label>
                <select 
                  value={resetAnnee} 
                  onChange={(e) => setResetAnnee(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-700"
                >
                  <option value="TOTAL">Toutes les années (Historique complet)</option>
                  {[2021, 2022, 2023, 2024, 2025, 2026].map(year => (
                    <option key={`reset-${year}`} value={year}>
                      Exercice {year}-{year + 1} (01/09/{String(year).slice(-2)} au 31/08/{String(year + 1).slice(-2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Choisir la source à effacer</label>
                <div className="space-y-2.5">
                  <button onClick={() => handleResetPartiel('banque')} className="w-full text-left px-4 py-3 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl font-bold text-sm flex items-center justify-between transition-colors">
                    <span>Journal de Banque</span>
                    <Trash2 size={16} className="text-blue-500"/>
                  </button>
                  <button onClick={() => handleResetPartiel('paie')} className="w-full text-left px-4 py-3 border border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-900 rounded-xl font-bold text-sm flex items-center justify-between transition-colors">
                    <span>Fiches de Paie</span>
                    <Trash2 size={16} className="text-pink-500"/>
                  </button>
                  <button onClick={() => handleResetPartiel('od')} className="w-full text-left px-4 py-3 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl font-bold text-sm flex items-center justify-between transition-colors">
                    <span>Opérations Diverses (OD)</span>
                    <Trash2 size={16} className="text-purple-500"/>
                  </button>
                  <button onClick={() => handleResetPartiel('ndf')} className="w-full text-left px-4 py-3 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-sm flex items-center justify-between transition-colors">
                    <span>Notes de Frais (NDF)</span>
                    <Trash2 size={16} className="text-amber-500"/>
                  </button>
                  <div className="h-px bg-slate-200 my-4 w-full"></div>
                  <button onClick={() => handleResetPartiel('tout')} className="w-full text-left px-4 py-3 border border-rose-300 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-900 rounded-xl font-black text-sm flex items-center justify-between transition-colors group">
                    <span>⚠️ TOUTES LES SOURCES</span>
                    <AlertTriangle size={18} className="text-rose-500 group-hover:text-white"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EN-TÊTE DASHBOARD COMPTABLE */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
              <BookOpen size={24} />
            </span>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Grand Livre Comptable</h2>
              <p className="text-indigo-200/70 text-xs md:text-sm mt-0.5">Console d'importation, ventilation des OD et suivi analytique.</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-indigo-200/80 tracking-wider">Écritures affichées</span>
            <span className="text-lg font-black text-white">{filteredAndSortedTransactions.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">Total Débit</span>
            <span className="text-lg font-black text-rose-300">{formatMontantTableau(totalGeneralDebit)} €</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Total Crédit</span>
            <span className="text-lg font-black text-emerald-300">{formatMontantTableau(totalGeneralCredit)} €</span>
          </div>
        </div>
      </div>

      {lastImportBatch && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300/60 text-amber-950 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
              <AlertTriangle size={18} />
            </span>
            <span className="text-sm font-semibold">Dernier import : <strong>{lastImportBatch.source}</strong> ({lastImportBatch.count} lignes).</span>
          </div>
          <button onClick={handleUndoLastImport} className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm">
            <XCircle size={16} className="text-amber-600" /> Annuler cet import
          </button>
        </div>
      )}

      {/* PANNEAUX D'ACTIONS : DISPOSITION HORIZONTALE COMPACTE CÔTE À CÔTE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ONGLET BANQUE */}
        <div className={`bg-white border rounded-3xl shadow-sm flex flex-col transition-all overflow-hidden ${activeTab === 'banque' ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-slate-200/80 hover:border-indigo-300'}`}>
          <button onClick={() => setActiveTab(activeTab === 'banque' ? null : 'banque')} className={`w-full text-left p-5 flex justify-between items-center transition-colors ${activeTab === 'banque' ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'banque' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-indigo-50 text-indigo-600'}`}>
                <Download size={20} />
              </div>
              <div>
                <h3 className={`font-extrabold text-base ${activeTab === 'banque' ? 'text-indigo-950' : 'text-slate-800'}`}>Journal de Banque</h3>
                <p className="text-xs text-slate-500 mt-0.5">Import des relevés</p>
              </div>
            </div>
            <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${activeTab === 'banque' ? 'rotate-180 text-indigo-600' : ''}`} />
          </button>
          {activeTab === 'banque' && (
            <div className="p-5 pt-0 animate-fade-in flex-1 flex flex-col justify-end">
              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex flex-col gap-4 text-center mt-4">
                <p className="text-xs text-indigo-900 leading-relaxed">Formats acceptés : <strong>.CSV</strong> ou <strong>.XLSX</strong>.</p>
                <button onClick={() => fileInputBankRef.current.click()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 active:scale-95">
                  <Download size={16} /> Parcourir le fichier
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ONGLET PAIE */}
        <div className={`bg-white border rounded-3xl shadow-sm flex flex-col transition-all overflow-hidden ${activeTab === 'paie' ? 'border-pink-400 ring-4 ring-pink-50' : 'border-slate-200/80 hover:border-pink-300'}`}>
          <button onClick={() => setActiveTab(activeTab === 'paie' ? null : 'paie')} className={`w-full text-left p-5 flex justify-between items-center transition-colors ${activeTab === 'paie' ? 'bg-pink-50/50' : 'hover:bg-slate-50/50'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'paie' ? 'bg-pink-600 text-white shadow-md shadow-pink-200' : 'bg-pink-50 text-pink-600'}`}>
                <Users size={20} />
              </div>
              <div>
                <h3 className={`font-extrabold text-base ${activeTab === 'paie' ? 'text-pink-950' : 'text-slate-800'}`}>Fiches de Paie</h3>
                <p className="text-xs text-slate-500 mt-0.5">Intégration du journal des salaires</p>
              </div>
            </div>
            <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${activeTab === 'paie' ? 'rotate-180 text-pink-600' : ''}`} />
          </button>
          {activeTab === 'paie' && (
            <div className="p-5 pt-0 animate-fade-in flex-1 flex flex-col justify-end">
              <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100 flex flex-col gap-4 text-center mt-4">
                <p className="text-xs text-pink-900 leading-relaxed">Formats acceptés : <strong>.TXT</strong> ou <strong>.TSV</strong>.<br/>Import de votre logiciel de paie externe.</p>
                <button onClick={() => fileInputPaieRef.current.click()} className="w-full bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-200 active:scale-95">
                  <Users size={16} /> Sélectionner le fichier
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ONGLET OD */}
        <div className={`bg-white border rounded-3xl shadow-sm flex flex-col transition-all overflow-hidden lg:col-span-1 md:col-span-2 ${activeTab === 'od' ? 'border-purple-400 ring-4 ring-purple-50 lg:col-span-3' : 'border-slate-200/80 hover:border-purple-300'}`}>
          <button onClick={() => setActiveTab(activeTab === 'od' ? null : 'od')} className={`w-full text-left p-5 flex justify-between items-center transition-colors ${activeTab === 'od' ? 'bg-purple-50/50' : 'hover:bg-slate-50/50'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'od' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-purple-50 text-purple-600'}`}>
                <FileText size={20} />
              </div>
              <div>
                <h3 className={`font-extrabold text-base ${activeTab === 'od' ? 'text-purple-950' : 'text-slate-800'}`}>Opération Diverse</h3>
                <p className="text-xs text-slate-500 mt-0.5">Saisie ou Import masse</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); fileInputODRef.current.click(); }} className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm" title="Importer un fichier d'OD ou de Paie en masse (.csv / .xlsx)">
                <Download size={13}/> Import masse
              </button>
              <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${activeTab === 'od' ? 'rotate-180 text-purple-600' : ''}`} />
            </div>
          </button>
          
          {activeTab === 'od' && (
            <div className="p-5 pt-0 animate-fade-in bg-purple-50/30">
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <input type="date" value={odFormDate} onChange={e => setOdFormDate(e.target.value)} className="w-1/3 border border-slate-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-600 font-mono font-semibold shadow-sm" />
                    <input type="text" placeholder="Libellé OD..." value={odFormLibelle} onChange={e => setOdFormLibelle(e.target.value)} className="flex-1 border border-slate-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-600 font-medium shadow-sm" />
                  </div>
                  <input type="text" placeholder="Commentaire ou référence optionnelle..." value={odFormCommentaire} onChange={e => setOdFormCommentaire(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-600 shadow-sm" />
                </div>

                <div className="space-y-3 mt-2">
                  {odLines.map((l) => (
                    <div key={l.id} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <div className="w-full md:flex-1 relative">
                        <SearchableCompteSelect 
                          value={l.compte || ''}
                          comptesList={comptesList}
                          placeholder="Sélectionnez ou tapez (ex: 606100)"
                          onChange={(val) => updateOdLine(l.id, 'compte', val)}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 right-8 pointer-events-none opacity-0">
                          <input type="text" className="hidden" value={l.compte} onBlur={e => handleCompteOdBlur(l.id, e.target.value)} />
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <input type="number" placeholder="Débit €" value={l.debit} onChange={e => updateOdLine(l.id, 'debit', e.target.value)} className="border border-slate-200 rounded-xl p-2 text-sm bg-slate-50 w-full md:w-32 outline-none focus:ring-2 focus:ring-purple-600 font-bold text-right" />
                        <input type="number" placeholder="Crédit €" value={l.credit} onChange={e => updateOdLine(l.id, 'credit', e.target.value)} className="border border-slate-200 rounded-xl p-2 text-sm bg-slate-50 w-full md:w-32 outline-none focus:ring-2 focus:ring-purple-600 font-bold text-right" />
                        <button onClick={() => removeOdLine(l.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-slate-100 rounded-xl shrink-0"><XCircle size={18} /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addOdLine} className="text-sm text-purple-600 font-bold hover:underline flex items-center gap-1 p-1 ml-1">+ Ajouter une ligne de ventilation</button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-purple-200/50 mt-2">
                  <div className={`flex items-center gap-4 px-4 py-2.5 rounded-xl border w-full sm:w-auto justify-between sm:justify-start transition-colors ${isOdBalanced ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    <span className="uppercase text-xs font-bold tracking-wider">Équilibre</span>
                    <div className="flex gap-4 font-mono text-sm">
                      <span className={isOdBalanced ? 'text-emerald-700 font-extrabold' : 'text-rose-600 font-bold'}>D: {formatMontantTableau(totalDebitOD)} €</span>
                      <span className={isOdBalanced ? 'text-emerald-700 font-extrabold' : 'text-rose-600 font-bold'}>C: {formatMontantTableau(totalCreditOD)} €</span>
                    </div>
                  </div>

                  <button onClick={handleAddOD} disabled={!isOdBalanced} className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${isOdBalanced ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 cursor-pointer active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
                    <CheckCircle2 size={16} /> Enregistrer l'OD
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SAS D'IMPUTATION BANCAIRE */}
      {lignesEnAttente.length > 0 && (
        <div className="bg-orange-50/80 p-6 rounded-3xl border border-orange-200/80 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-orange-500 text-white rounded-2xl shadow-sm"><AlertTriangle size={20} /></span>
              <div>
                <h3 className="font-extrabold text-orange-950 text-base">Lignes bancaires à imputer ({lignesEnAttente.length})</h3>
                <p className="text-xs text-orange-800/80">Recherche par numéro de compte ou par mot-clé (ex : AS, loyer, banque).</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {nbLignesPretes > 0 && (
                <button onClick={() => { lignesEnAttente.forEach(l => { if(l.comptePropose) validerLigneBank(l.id, l.comptePropose, l.commentaire); }); }} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-200">
                  <CheckCircle2 size={16} /> Tout Valider ({nbLignesPretes})
                </button>
              )}
              <button onClick={() => setLignesEnAttente([])} className="text-xs bg-white border border-orange-300 hover:bg-orange-100 text-orange-900 px-3.5 py-2.5 rounded-xl font-bold transition-colors">
                <XCircle size={15} /> Vider la liste
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-orange-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-100/50 text-orange-950 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Libellé</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4">Commentaire</th>
                  <th className="py-3 px-4 min-w-[280px]">Compte comptable (Recherchable)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {lignesEnAttente.map((ligne) => (
                  <tr key={ligne.id} className="hover:bg-orange-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600 whitespace-nowrap">{normaliserDateFR(ligne.date)}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 truncate max-w-xs">{ligne.libelle}</td>
                    <td className={`py-3 px-4 text-right font-extrabold font-mono whitespace-nowrap ${ligne.montant > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {ligne.montant > 0 ? '+' : ''}{formatMontantTableau(Math.abs(ligne.montant))} €
                    </td>
                    <td className="py-3 px-4">
                      <input type="text" placeholder="Ajouter un commentaire..." value={ligne.commentaire || ''} onChange={(e) => { const val = e.target.value; setLignesEnAttente(prev => prev.map(l => l.id === ligne.id ? { ...l, commentaire: val } : l)); }} className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs w-full outline-none focus:border-indigo-500 bg-slate-50/50" />
                    </td>
                    <td className="py-3 px-4 min-w-[280px]">
                      <SearchableCompteSelect 
                        value={ligne.comptePropose || ''} 
                        comptesList={comptesList} 
                        onChange={(val) => { 
                          setLignesEnAttente(prev => prev.map(l => {
                            if (l.id === ligne.id) {
                              return { ...l, comptePropose: val, modifieManuellement: true };
                            }
                            if (l.libelle === ligne.libelle && !l.modifieManuellement) {
                              return { ...l, comptePropose: val };
                            }
                            return l;
                          })); 
                        }} 
                      />
                      {ligne.comptePropose && !ligne.modifieManuellement && (
                        <div className="text-[10px] text-indigo-500 font-bold mt-1.5 pr-1 flex items-center justify-end gap-1">
                          <Sparkles size={12} /> Suggestion auto
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => validerLigneBank(ligne.id, ligne.comptePropose, ligne.commentaire)} disabled={!ligne.comptePropose} className={`p-2 rounded-xl transition-all shadow-sm ${ligne.comptePropose ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                          <CheckCircle2 size={16} />
                        </button>
                        <button onClick={() => setLignesEnAttente(prev => prev.filter(l => l.id !== ligne.id))} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLEAU GRAND LIVRE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden mt-8">
        <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl"><CheckCircle2 size={18} /></span>
            <h3 className="font-extrabold text-slate-800 text-base">Écritures Validées au Grand Livre</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            {/* NOUVEAU BOUTON : EXPORT CSV */}
            <button onClick={handleExportCSV} className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95" title="Exporter le tableau actuel sur Excel (CSV)">
              <Download size={14} /> Exporter (.csv)
            </button>

            {/* BOUTON D'OUVERTURE DE LA MODALE DE SUPPRESSION SÉLECTIVE */}
            <button onClick={() => setShowResetModal(true)} className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95" title="Vider le Grand Livre de manière sélective">
              <Trash2 size={14} /> Vider le Grand Livre (Filtre)
            </button>

            {/* NOUVEAU FILTRE PAR ANNÉE SCOLAIRE */}
            <select 
              value={anneeFiltre} 
              onChange={(e) => setAnneeFiltre(e.target.value)}
              className="border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 shadow-sm"
            >
              <option value="TOTAL">Toutes les années</option>
              {[2021, 2022, 2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>
                  01/09/{String(year).slice(-2)} - 31/08/{String(year + 1).slice(-2)}
                </option>
              ))}
            </select>

            {/* NOUVEAU FILTRE PAR SOURCE */}
            <select 
              value={selectedSourceFilter} 
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 shadow-sm"
            >
              <option value="">Toutes les sources</option>
              <option value="banque">🏦 Banque</option>
              <option value="paie">👥 Paie</option>
              <option value="od">📝 OD</option>
              <option value="ndf">🧾 NDF</option>
            </select>

            <select value={selectedCompteFilter} onChange={(e) => setSelectedCompteFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-600 font-mono font-bold text-slate-700 shadow-sm">
              <option value="">Tous les comptes (Filtre...)</option>
              {comptesList.map(c => <option key={`filter-${c.id}`} value={c.code}>{c.code} - {c.libelle}</option>)}
            </select>

            {/* BOUTON DE RÉINITIALISATION DYNAMIQUE DES FILTRES */}
            {(selectedCompteFilter !== '' || selectedSourceFilter !== '' || anneeFiltre !== 'TOTAL') && (
              <button onClick={() => { setSelectedCompteFilter(''); setSelectedSourceFilter(''); setAnneeFiltre('TOTAL'); }} className="text-xs text-indigo-600 font-bold hover:underline">
                Réinitialiser
              </button>
            )}

            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Rechercher écriture..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none bg-white shadow-sm" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs text-left min-w-max">
            <thead className="bg-slate-100/70 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider sticky top-0 backdrop-blur-md shadow-sm z-10">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors whitespace-nowrap" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-3 text-slate-400">ID</th>
                <th className="py-3.5 px-3 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => handleSort('source')}>
                  <div className="flex items-center gap-1">Source {sortConfig.key === 'source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors min-w-[220px]" onClick={() => handleSort('libelle')}>
                  <div className="flex items-center gap-1">Libellé {sortConfig.key === 'libelle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-3 text-slate-400 min-w-[140px]">Référence</th>
                <th className="py-3.5 px-3 text-slate-400">Type Op.</th>
                <th className="py-3.5 px-4 text-slate-400 min-w-[180px]">Commentaire</th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => handleSort('debit')}>
                  <div className="flex items-center justify-end gap-1">Débit {sortConfig.key === 'debit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => handleSort('credit')}>
                  <div className="flex items-center justify-end gap-1">Crédit {sortConfig.key === 'credit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors min-w-[220px]" onClick={() => handleSort('compte')}>
                  <div className="flex items-center gap-1">Détail Compte {sortConfig.key === 'compte' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredAndSortedTransactions.map(t => {
                let sourceLabel = 'Banque';
                let sourceColor = 'bg-blue-50 text-blue-700 border-blue-200';
                if (t.type === 'od') {
                  if (t.typeOp === 'PAIE' || (t.libelle && String(t.libelle).includes('(PAIE)'))) {
                    sourceLabel = 'Paie';
                    sourceColor = 'bg-pink-50 text-pink-700 border-pink-200';
                  } else if (t.typeOp === 'NDF' || (t.libelle && String(t.libelle).includes('(NDF)'))) {
                    sourceLabel = 'NDF';
                    sourceColor = 'bg-amber-50 text-amber-700 border-amber-200';
                  } else {
                    sourceLabel = 'OD';
                    sourceColor = 'bg-purple-50 text-purple-700 border-purple-200';
                  }
                }

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600 whitespace-nowrap">{normaliserDateFR(t.date)}</td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[10px]" title={t.id}>{t.id.substring(0, 6)}...</td>
                    <td className="py-3.5 px-3"><span className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap ${sourceColor}`}>{sourceLabel}</span></td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold whitespace-normal max-w-xs leading-snug">{t.libelle}</td>
                    <td className="py-3.5 px-3 text-slate-500 text-xs whitespace-normal max-w-[140px]">{t.reference || <span className="text-slate-300 italic">-</span>}</td>
                    <td className="py-3.5 px-3 text-slate-500 text-xs whitespace-nowrap">{t.typeOp || <span className="text-slate-300 italic">-</span>}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-normal max-w-[180px]">
                      {editingRowId === t.id ? (
                        <input type="text" defaultValue={t.commentaire || ''} onBlur={(e) => handleUpdateField(t.id, e.target.value, 'commentaire')} className="border border-indigo-300 rounded-lg p-1.5 text-xs bg-indigo-50/50 w-full outline-none" placeholder="Modifier commentaire..." autoFocus />
                      ) : ( t.commentaire || <span className="text-slate-300 italic">-</span> )}
                    </td>
                    {t.type === 'od' ? (
                      <>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700 whitespace-nowrap">{t.compteDebit ? formatMontantTableau(t.montant) + ' €' : '-'}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700 whitespace-nowrap">{t.compteCredit ? formatMontantTableau(t.montant) + ' €' : '-'}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-rose-600 whitespace-nowrap">{t.montant < 0 ? formatMontantTableau(Math.abs(t.montant)) + ' €' : '-'}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-600 whitespace-nowrap">{t.montant > 0 ? formatMontantTableau(t.montant) + ' €' : '-'}</td>
                      </>
                    )}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      {editingRowId === t.id ? (
                        <SearchableCompteSelect value={t.compte || t.compteDebit || t.compteCredit || ''} comptesList={comptesList} onChange={(val) => { if (t.type === 'od') { handleUpdateField(t.id, val, t.compteDebit ? 'compteDebit' : 'compteCredit'); } else { handleUpdateField(t.id, val, 'compte'); } setEditingRowId(null); }} />
                      ) : (
                        t.type === 'od' ? (
                          (t.compteDebit && t.compteCredit) ? (
                            <div className="flex flex-col gap-0.5 min-w-[200px]">
                              <div className="text-xs text-slate-500 truncate"><span className="font-bold text-slate-700">D:</span> {t.compteDebit} {t.compteDebit && `- ${comptesList.find(c => String(c.code) === String(t.compteDebit))?.libelle || ''}`}</div>
                              <div className="text-xs text-slate-500 truncate"><span className="font-bold text-slate-700">C:</span> {t.compteCredit} {t.compteCredit && `- ${comptesList.find(c => String(c.code) === String(t.compteCredit))?.libelle || ''}`}</div>
                            </div>
                          ) : (
                            <div className="flex items-center w-fit min-w-[200px]"><span className="bg-purple-50/80 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold text-purple-800 border border-purple-200/80 max-w-[240px] truncate shadow-2xs">{t.compteDebit ? `${t.compteDebit} - ${comptesList.find(c => String(c.code) === String(t.compteDebit))?.libelle || ''}` : `${t.compteCredit} - ${comptesList.find(c => String(c.code) === String(t.compteCredit))?.libelle || ''}`}</span></div>
                          )
                        ) : (
                          <div className="flex items-center w-fit min-w-[200px]"><span className="bg-slate-100/80 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 border border-slate-200/80 max-w-[240px] truncate shadow-2xs">{t.compte ? `${t.compte} - ${comptesList.find(c => String(c.code) === String(t.compte))?.libelle || ''}` : 'Non défini'}</span></div>
                        )
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        {editingRowId === t.id ? (
                          <button onClick={() => setEditingRowId(null)} className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-xl text-xs font-bold transition-colors shadow-sm">OK</button>
                        ) : (
                          <>
                            <button onClick={() => setEditingRowId(t.id)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors" title="Modifier"><span className="font-bold text-base leading-none">✎</span></button>
                            {t.pdfData ? (
                              <div className="relative group/pdf inline-block">
                                <button onClick={() => { const win = window.open(); if (win) { win.document.write(`<iframe src="${t.pdfData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`); } }} className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-xl bg-indigo-50 border border-indigo-200 transition-all shadow-2xs" title={`Voir la facture/justificatif : ${t.pdfName || 'Pièce jointe'}`}>
                                  <Receipt size={16} className="text-indigo-600" />
                                </button>
                                <button onClick={async (e) => { e.stopPropagation(); if (window.confirm("Supprimer la pièce jointe ?")) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', t.id), { pdfData: '', pdfName: '' }); } }} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center opacity-0 group-hover/pdf:opacity-100 transition-opacity shadow-xs" title="Supprimer la pièce jointe">×</button>
                              </div>
                            ) : (
                              <button onClick={() => handleTriggerPdf(t.id)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors" title="Joindre un PDF ou justificatif"><Paperclip size={16} /></button>
                            )}
                            {confirmDeleteId === t.id ? (
                              <button onClick={() => handleDeleteValidated(t.id)} className="text-white bg-rose-600 hover:bg-rose-700 px-2 py-1 rounded-lg text-[10px] font-extrabold animate-pulse">Valider ?</button>
                            ) : (
                              <button onClick={() => handleDeleteValidated(t.id)} className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="Supprimer"><Trash2 size={16}/></button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSortedTransactions.length === 0 && (
                <tr>
                  <td colSpan="11" className="py-16 text-center bg-slate-50/40">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="p-4 bg-slate-100 text-slate-400 rounded-3xl"><BookOpen size={32} /></div>
                      <h4 className="font-bold text-slate-700 text-base">Aucune écriture au Grand Livre</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Importe un relevé bancaire, un fichier de paie ou enregistre une opération diverse pour alimenter ta comptabilité.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- 4. PLAN COMPTABLE ---
const PlanComptable = () => {
  const [comptes, setComptes] = useState([]);
  const [newCompte, setNewCompte] = useState({ code: '', libelle: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ code: '', libelle: '' });

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'comptes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste = [];
      snapshot.forEach((doc) => {
        liste.push({ id: doc.id, ...doc.data() });
      });
      liste.sort((a, b) => a.code.localeCompare(b.code));
      setComptes(liste);
    });
    return () => unsubscribe();
  }, []);

  const handleAddCompte = async () => {
    if (!newCompte.code || !newCompte.libelle) return;
    if (comptes.some(c => c.code === newCompte.code)) {
      alert("Ce numéro de compte existe déjà !");
      return;
    }
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'comptes'), {
        code: newCompte.code,
        libelle: newCompte.libelle
      });
      setNewCompte({ code: '', libelle: '' });
    } catch(e) {
      alert("Erreur lors de l'ajout du compte.");
    }
  };

  const handleDeleteCompte = async (id, code) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le compte ${code} ?`)) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comptes', id));
      } catch(e) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const startEdit = (compte) => {
    setEditingId(compte.id);
    setEditForm({ code: compte.code, libelle: compte.libelle });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.code || !editForm.libelle) return alert("Les champs ne peuvent pas être vides.");
    if (comptes.some(c => c.code === editForm.code && c.id !== id)) {
      alert("Ce numéro de compte est déjà utilisé par un autre compte !");
      return;
    }
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comptes', id), {
        code: editForm.code,
        libelle: editForm.libelle
      });
      setEditingId(null);
    } catch(e) {
      alert("Erreur lors de la modification.");
    }
  };

  const filteredComptes = comptes.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> Plan Comptable
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gérez la nomenclature de vos comptes (Classe 1 à 7).</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          <span className="text-indigo-800 font-bold text-lg">{comptes.length}</span>
          <span className="text-indigo-600 text-sm ml-1">comptes actifs</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Créer un nouveau compte</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Code (ex: 606100)" 
              value={newCompte.code}
              onChange={e => setNewCompte({...newCompte, code: e.target.value.replace(/[^0-9]/g, '')})}
              className="border border-slate-300 rounded-lg p-2 text-sm w-1/3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <input 
              type="text" 
              placeholder="Libellé du compte..." 
              value={newCompte.libelle}
              onChange={e => setNewCompte({...newCompte, libelle: e.target.value})}
              className="border border-slate-300 rounded-lg p-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => { if(e.key === 'Enter') handleAddCompte(); }}
            />
            <button onClick={handleAddCompte} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors" title="Ajouter le compte">
              <PlusCircle size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Rechercher un compte</h3>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tapez un numéro ou un mot-clé..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-300 rounded-lg p-2 pl-10 text-sm w-full outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
            <tr>
              <th className="py-3 px-4 w-32">N° de Compte</th>
              <th className="py-3 px-4">Libellé Comptable</th>
              <th className="py-3 px-4 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredComptes.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-2.5 px-4 font-mono">
                  {editingId === c.id ? (
                    <input 
                      type="text" 
                      value={editForm.code} 
                      onChange={e => setEditForm({...editForm, code: e.target.value.replace(/[^0-9]/g, '')})}
                      className="border border-indigo-400 bg-indigo-50 text-indigo-900 rounded px-2 py-1 w-full outline-none font-bold"
                    />
                  ) : (
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-700 font-bold">
                      {c.code}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-slate-800 font-medium">
                  {editingId === c.id ? (
                    <input 
                      type="text" 
                      value={editForm.libelle} 
                      onChange={e => setEditForm({...editForm, libelle: e.target.value})}
                      className="border border-indigo-400 bg-indigo-50 text-indigo-900 rounded px-2 py-1 w-full outline-none"
                      onKeyDown={(e) => { if(e.key === 'Enter') handleSaveEdit(c.id); }}
                    />
                  ) : (
                    c.libelle
                  )}
                </td>
                <td className="py-2.5 px-4 text-center">
                  <div className="flex justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {editingId === c.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(c.id)} className="text-emerald-600 hover:bg-emerald-100 p-1.5 rounded transition-colors" title="Enregistrer">
                          <CheckCircle2 size={18} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded transition-colors" title="Annuler">
                          <XCircle size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(c)} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition-colors" title="Modifier le compte">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteCompte(c.id, c.code)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors" title="Supprimer le compte">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredComptes.length === 0 && (
              <tr>
                <td colSpan="3" className="py-8 text-center text-slate-400">
                  Aucun compte trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Utilitaire de conversion en toutes lettres pour le Cerfa
const nombreEnLettres = (n) => {
  if (n === 0) return 'zéro';
  const unites = ['','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
  const dizaines = ['','dix','vingt','trente','quarante','cinquante','soixante','soixante-dix','quatre-vingt','quatre-vingt-dix'];
  
  const convert = (num) => {
    if (num < 20) return unites[num];
    let d = Math.floor(num/10); let u = num%10;
    if (d === 7 || d === 9) {
      if (u === 1 && d === 7) return dizaines[d-1] + ' et onze';
      return dizaines[d-1] + '-' + unites[10+u];
    }
    if (u === 0) return dizaines[d] + (d===8 ? 's' : '');
    if (u === 1) return dizaines[d] + (d===8 ? '-un' : ' et un');
    return dizaines[d] + '-' + unites[u];
  };

  const convert100 = (num) => {
    let c = Math.floor(num/100); let r = num%100; let res = '';
    if (c === 1) res = 'cent'; else if (c > 1) res = unites[c] + ' cent' + (r === 0 ? 's' : '');
    if (r > 0) res += (res ? ' ' : '') + convert(r);
    return res;
  };

  const convert1000 = (num) => {
    let m = Math.floor(num/1000); let r = num%1000; let res = '';
    if (m === 1) res = 'mille'; else if (m > 1) res = convert100(m) + ' mille';
    if (r > 0) res += (res ? ' ' : '') + convert100(r);
    return res;
  };

  let intPart = Math.floor(n);
  let decPart = Math.round((n - intPart) * 100);
  let str = convert1000(intPart) + ' euro' + (intPart > 1 ? 's' : '');
  if (decPart > 0) str += ' et ' + convert(decPart) + ' centime' + (decPart > 1 ? 's' : '');
  return str;
};

// --- MODULE : NOTES DE FRAIS ---
const NotesFrais = ({ transactionsGlobales }) => {
  const [activeView, setActiveView] = useState('saisie');
  const [notes, setNotes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [modal, setModal] = useState({ isOpen: false, type: '', payload: null });
  const [promptValue, setPromptValue] = useState('');

  const [formData, setFormData] = useState({
    demandeur: '', adresse: '', date: '', description: '', categorie: 'Pédagogie', typeFrais: 'remboursement', montant: '', justificatifFile: null, ribFile: null
  });

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'notes_frais');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste = [];
      snapshot.forEach((doc) => { liste.push({ id: doc.id, ...doc.data() }); });
      liste.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
      setNotes(liste);
    });
    return () => unsubscribe();
  }, []);

  const closeCustomModal = () => { setModal({ isOpen: false, type: '', payload: null }); setPromptValue(''); };
  const showAlert = (title, message, isError = false) => { setModal({ isOpen: true, type: 'alert', payload: { title, message, isError } }); };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    // NOUVELLE LIMITE : 5 Mo
    if (file.size > 5 * 1024 * 1024) {
      showAlert("Fichier trop lourd", "Le fichier dépasse la limite autorisée de 5 Mo. Veuillez réduire sa taille.", true);
      return;
    }
    // On sauvegarde le VRAI fichier en mémoire (et plus du texte Base64)
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.demandeur || !formData.date || !formData.montant || !formData.description) return showAlert("Champs manquants", "Veuillez remplir tous les champs obligatoires (*).", true);
    if (formData.typeFrais === 'abandon' && !formData.adresse) return showAlert("Adresse requise", "L'adresse postale est obligatoire pour le reçu fiscal.", true);
    if (formData.typeFrais === 'remboursement' && !formData.ribFile) return showAlert("RIB manquant", "Le RIB est obligatoire pour le remboursement.", true);
    if (!formData.justificatifFile) return showAlert("Justificatif manquant", "La facture/ticket est obligatoire.", true);

    setIsUploading(true);
    try {
      // 1. Upload sur le Firebase Storage (Le vrai disque dur)
      let justificatifUrl = null;
      if (formData.justificatifFile) {
        const justifRef = ref(storage, `notes_frais/${appId}_${Date.now()}_justif_${formData.justificatifFile.name}`);
        await uploadBytes(justifRef, formData.justificatifFile);
        justificatifUrl = await getDownloadURL(justifRef);
      }

      let ribUrl = null;
      if (formData.ribFile && formData.typeFrais === 'remboursement') {
        const ribRef = ref(storage, `notes_frais/${appId}_${Date.now()}_rib_${formData.ribFile.name}`);
        await uploadBytes(ribRef, formData.ribFile);
        ribUrl = await getDownloadURL(ribRef);
      }

      // 2. Enregistrement dans la base de données
      const newNote = {
        demandeur: formData.demandeur, adresse: formData.adresse, date: formData.date, description: formData.description,
        categorie: formData.categorie, typeFrais: formData.typeFrais, montant: parseFloat(formData.montant),
        justificatifFile: justificatifUrl, ribFile: ribUrl, statut: 'attente_president', date_creation: new Date().toISOString()
      };

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'notes_frais'), newNote);
      
      showAlert("Succès", "Note de frais soumise avec succès !");
      setFormData({ demandeur: '', adresse: '', date: '', description: '', categorie: 'Pédagogie', typeFrais: 'remboursement', montant: '', justificatifFile: null, ribFile: null });
      setActiveView('suivi');
    } catch (err) { 
      showAlert("Erreur technique", "L'envoi des fichiers a échoué. Vérifiez que votre Firebase Storage est bien activé et configuré.", true); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleValiderPresident = async (note) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notes_frais', note.id), { statut: 'attente_tresorier' });
      showAlert("Validation réussie", "La note a bien été validée et transmise au trésorier.");
    } catch (err) { showAlert("Erreur", "Erreur lors de la validation.", true); }
  };

  const executeTresorier = async (note) => {
    closeCustomModal();
    const isAbandon = note.typeFrais === 'abandon';
    try {
      if (isAbandon) {
        let compteCharge = '658000';
        if (note.categorie === 'Pédagogie') compteCharge = '606400';
        if (note.categorie === 'Fonctionnement') compteCharge = '606800';
        if (note.categorie === 'Déplacement') compteCharge = '625100';
        if (note.categorie === 'Repas') compteCharge = '625600';

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
          batchId: 'NDF_' + Date.now(), date: normaliserDateFR(new Date()), libelle: `(NDF) Abandon de frais - ${note.demandeur}`,
          montant: note.montant, type: 'od', compteDebit: compteCharge, compteCredit: '754000', 
          reference: `NDF-${note.id.substring(0, 4).toUpperCase()}`, typeOp: 'NDF', commentaire: note.description, date_creation: new Date().toISOString()
        });
      }

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notes_frais', note.id), { statut: isAbandon ? 'traitee_abandon' : 'payee', date_paiement: new Date().toISOString() });
      showAlert("Opération validée", isAbandon ? "Le don a été comptabilisé dans le Grand Livre !" : "La note est marquée payée.");
    } catch (err) { showAlert("Erreur", "Une erreur comptable est survenue.", true); }
  };

  const executeRefus = async (noteId, motif) => {
    closeCustomModal();
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notes_frais', noteId), { statut: 'refusee', motif_refus: motif });
      showAlert("Note refusée", "La demande a été rejetée.");
    } catch (err) { showAlert("Erreur", "Impossible de rejeter la note.", true); }
  };

  const executeDelete = async (noteId) => {
    closeCustomModal();
    try {
      const noteToDelete = notes.find(n => n.id === noteId);
      if (noteToDelete && noteToDelete.statut === 'traitee_abandon') {
        const refString = `NDF-${noteId.substring(0, 4).toUpperCase()}`;
        const linkedTxs = (transactionsGlobales || []).filter(tx => tx.reference === refString && tx.typeOp === 'NDF');
        for (const tx of linkedTxs) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', tx.id)); }
      }
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notes_frais', noteId));
      showAlert("Suppression réussie", "Note de frais effacée (et son écriture comptable si existante).");
    } catch (err) { showAlert("Erreur", "Impossible de supprimer la ligne.", true); }
  };

  // NOUVEAU : Ouverture du lien Firebase Storage
  const openDocument = (url) => {
    if (url) window.open(url, '_blank');
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'attente_president': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><Clock size={12}/> Attente Président</span>;
      case 'attente_tresorier': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><Clock size={12}/> Attente Trésorier</span>;
      case 'payee': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><CheckCircle2 size={12}/> Payée</span>;
      case 'traitee_abandon': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><Heart size={12}/> Don Comptabilisé</span>;
      case 'refusee': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><XCircle size={12}/> Refusée</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 font-sans">
      
      {/* MODAL PERSONNALISÉ POUR LES VALIDATIONS */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className={`bg-white rounded-3xl shadow-2xl border w-full max-w-md overflow-hidden transition-all scale-100 ${modal.payload?.isError ? 'border-rose-100' : 'border-slate-100'}`}>
            <div className={`p-6 text-white flex justify-between items-center bg-gradient-to-r ${modal.type === 'tresorier' ? 'from-emerald-600 to-emerald-800' : modal.type === 'refus' || modal.type === 'delete' || modal.payload?.isError ? 'from-rose-600 to-rose-800' : 'from-indigo-600 to-indigo-800'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl">
                  {modal.type === 'tresorier' && <Euro size={22} className="text-emerald-100" />}
                  {modal.type === 'refus' && <XCircle size={22} className="text-rose-100" />}
                  {modal.type === 'delete' && <Trash2 size={22} className="text-rose-100" />}
                  {modal.type === 'alert' && <Info size={22} className="text-white" />}
                </div>
                <div><h3 className="font-bold text-lg leading-tight">{modal.type === 'tresorier' ? "Validation Trésorier" : modal.type === 'refus' ? "Refuser la demande" : modal.type === 'delete' ? "Suppression définitive" : modal.payload?.title || "Information"}</h3></div>
              </div>
              <button onClick={closeCustomModal} className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"><XCircle size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              {modal.type === 'alert' && <p className="text-slate-600 font-medium leading-relaxed">{modal.payload?.message}</p>}
              {modal.type === 'delete' && <p className="text-slate-600 font-medium leading-relaxed">Êtes-vous sûr de vouloir supprimer définitivement cette note de frais ? Cette action annulera l'écriture comptable si elle avait déjà été générée dans le Grand Livre.</p>}
              {modal.type === 'refus' && (<div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Motif du refus *</label><textarea value={promptValue} onChange={e => setPromptValue(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-rose-500 font-medium resize-none h-24" autoFocus /></div>)}
              {modal.type === 'tresorier' && (
                <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                  {modal.payload?.typeFrais === 'abandon' ? `Souhaitez-vous valider l'abandon de frais (Don) de ${modal.payload?.montant} € pour ${modal.payload?.demandeur} ?\n\nUne Opération Diverse (OD) sera générée automatiquement dans le Grand Livre.` : `Confirmez-vous avoir viré ${modal.payload?.montant} € à ${modal.payload?.demandeur} ?\n\nAucune écriture automatique ne sera générée (passez par l'import bancaire pour éviter les doublons).`}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3">
              {modal.type !== 'alert' && <button onClick={closeCustomModal} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors">Annuler</button>}
              {modal.type === 'alert' && <button onClick={closeCustomModal} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all ${modal.payload?.isError ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>OK</button>}
              {modal.type === 'delete' && <button onClick={() => executeDelete(modal.payload)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-700"><Trash2 size={16} /> Supprimer</button>}
              {modal.type === 'refus' && <button onClick={() => executeRefus(modal.payload, promptValue)} disabled={!promptValue.trim()} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 ${promptValue.trim() ? 'bg-gradient-to-r from-rose-600 to-rose-700' : 'bg-rose-300 cursor-not-allowed'}`}><XCircle size={16} /> Confirmer le refus</button>}
              {modal.type === 'tresorier' && <button onClick={() => executeTresorier(modal.payload)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700"><CheckCircle2 size={16} /> Valider l'opération</button>}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-indigo-600" /> Notes de Frais & Abandons
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gérez les demandes de remboursement et les abandons de frais (Dons).</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveView('saisie')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'saisie' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Saisir une dépense</button>
          <button onClick={() => setActiveView('suivi')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'suivi' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Suivi & Validations</button>
        </div>
      </div>

      {activeView === 'saisie' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 max-w-3xl mx-auto animate-fade-in relative">
          
          {/* OVERLAY DE CHARGEMENT */}
          {isUploading && (
            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-indigo-900">Envoi des justificatifs en cours...</p>
              <p className="text-xs text-indigo-600 mt-1">Merci de patienter (jusqu'à 5 Mo autorisés)</p>
            </div>
          )}

          <h3 className="font-black text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">Nouvelle déclaration de frais</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-6">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                <input type="radio" name="typeFrais" value="remboursement" checked={formData.typeFrais === 'remboursement'} onChange={(e) => setFormData({...formData, typeFrais: e.target.value})} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                Demande de remboursement
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-700">
                <input type="radio" name="typeFrais" value="abandon" checked={formData.typeFrais === 'abandon'} onChange={(e) => setFormData({...formData, typeFrais: e.target.value})} className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300" />
                Abandon de frais (Don)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Demandeur *</label>
                <input type="text" required value={formData.demandeur} onChange={e => setFormData({...formData, demandeur: e.target.value})} placeholder="Nom et Prénom" className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date de la dépense *</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
              </div>
            </div>

            {formData.typeFrais === 'abandon' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Adresse Postale * (Pour le reçu fiscal)</label>
                <input type="text" required={formData.typeFrais === 'abandon'} value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} placeholder="N° Rue, Code Postal, Ville" className="w-full border border-purple-200 bg-purple-50 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description de la dépense *</label>
              <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Achats Cultura (Cahiers, feutres...)" className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Catégorie Comptable</label>
                <select value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})} className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium">
                  <option value="Pédagogie">Matériel Pédagogique (606400)</option>
                  <option value="Fonctionnement">Frais de fonctionnement (606800)</option>
                  <option value="Déplacement">Déplacement / Péage (625100)</option>
                  <option value="Repas">Repas / Réception (625600)</option>
                  <option value="Autre">Autre (658000)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Montant TTC (€) *</label>
                <input type="number" step="0.01" required value={formData.montant} onChange={e => setFormData({...formData, montant: e.target.value})} placeholder="0.00" className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Justificatif / Facture *</span>
                  <span className="text-[10px] font-normal text-indigo-500">Max. 5 Mo</span>
                </label>
                <input type="file" accept="image/*,.pdf" required onChange={(e) => handleFileChange(e, 'justificatifFile')} className="text-xs w-full" />
                {formData.justificatifFile && <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ {formData.justificatifFile.name} (Prêt à l'envoi)</span>}
              </div>
              {formData.typeFrais === 'remboursement' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Votre RIB *</span>
                    <span className="text-[10px] font-normal text-indigo-500">Max. 5 Mo</span>
                  </label>
                  <input type="file" accept="image/*,.pdf" required onChange={(e) => handleFileChange(e, 'ribFile')} className="text-xs w-full" />
                  {formData.ribFile && <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ {formData.ribFile.name} (Prêt à l'envoi)</span>}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button type="submit" disabled={isUploading} className={`text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${isUploading ? 'bg-slate-400 cursor-not-allowed' : formData.typeFrais === 'abandon' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200 active:scale-95' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-95'}`}>
                {isUploading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Send size={18} />}
                {isUploading ? 'Envoi en cours...' : formData.typeFrais === 'abandon' ? 'Soumettre le Don' : 'Demander le remboursement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeView === 'suivi' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Demandeur</th>
                  <th className="p-4 min-w-[200px]">Description & PJ</th>
                  <th className="p-4 text-right">Montant</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-center">Actions (Trésorerie)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notes.map(note => (
                  <tr key={note.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-medium text-slate-600 whitespace-nowrap">{normaliserDateFR(note.date)}</td>
                    <td className="p-4 font-bold text-slate-800">
                      {note.demandeur}
                      <span className={`block mt-1 text-[9px] px-1.5 py-0.5 rounded w-fit uppercase font-bold ${note.typeFrais === 'abandon' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {note.typeFrais}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700">{note.description}</div>
                      <div className="flex gap-2 mt-2">
                        {note.justificatifFile && (
                          <button onClick={() => openDocument(note.justificatifFile)} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold flex items-center gap-1">
                            <Paperclip size={12}/> Facture
                          </button>
                        )}
                        {note.ribFile && (
                          <button onClick={() => openDocument(note.ribFile)} className="text-[10px] bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-indigo-600 font-bold flex items-center gap-1">
                            <Building size={12}/> RIB
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-black text-indigo-700 whitespace-nowrap">{formatMontant(note.montant)} €</td>
                    <td className="p-4">
                      <div className="flex justify-center">{getStatusBadge(note.statut)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2 flex-wrap max-w-[150px] mx-auto">
                        
                        {note.statut === 'attente_president' && (
                          <>
                            <button onClick={() => handleValiderPresident(note)} className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors w-full mb-1">Accord Président</button>
                            <button onClick={() => setModal({ isOpen: true, type: 'refus', payload: note.id })} className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg w-full text-[10px] font-bold">Refuser</button>
                          </>
                        )}

                        {note.statut === 'attente_tresorier' && (
                          <>
                            <button onClick={() => setModal({ isOpen: true, type: 'tresorier', payload: note })} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors w-full mb-1">
                              {note.typeFrais === 'abandon' ? 'Comptabiliser le Don' : 'Marquer Payée'}
                            </button>
                            <button onClick={() => setModal({ isOpen: true, type: 'refus', payload: note.id })} className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg w-full text-[10px] font-bold">Refuser</button>
                          </>
                        )}

                        <button onClick={() => setModal({ isOpen: true, type: 'delete', payload: note.id })} className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg transition-colors mt-1" title="Supprimer la note">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {notes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400 italic">Aucune note de frais enregistrée.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MODULE : DONS & REÇUS FISCAUX ---
const DonsRecus = ({ transactionsGlobales }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [dons, setDons] = useState([]);
  
  // Filtre de période
  const [anneeFiltre, setAnneeFiltre] = useState('TOTAL');

  // Objectif de dons modifiable (Appliqué comme référence annuelle)
  const [budgetGoal, setBudgetGoal] = useState(58724);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(58724);

  const [formData, setFormData] = useState({
    nom: '', prenom: '', type: 'Privé', frequence: 'Ponctuel', mail: '', adresse: '', date: '', montant: '', provenance: 'Virement', commentaire: '', apporteur: ''
  });

  const fileInputExcelRef = useRef(null);
  const fileInputHelloAssoRef = useRef(null);

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'dons');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste = [];
      snapshot.forEach((doc) => { liste.push({ id: doc.id, ...doc.data() }); });
      liste.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
      setDons(liste);
    });
    return () => unsubscribe();
  }, []);

  const parseAmt = (rawVal) => {
    if (!rawVal) return 0;
    if (typeof rawVal === 'number') return rawVal;
    let s = String(rawVal).replace(/[\s\u00A0\u202F€]/g, '');
    if (s.includes(',') && s.includes('.')) s = s.indexOf(',') < s.indexOf('.') ? s.replace(/,/g, '') : s.replace(/\./g, '').replace(',', '.');
    else if (s.includes(',')) s = s.replace(/,/g, '.');
    return parseFloat(s) || 0;
  };

  const extractExercice = (dateStr) => {
    if (!dateStr) return null;
    const str = String(dateStr).trim();
    let m, y;
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) { m = parseInt(parts[1], 10); y = parseInt(parts[2], 10); }
    } else if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) { y = parseInt(parts[0], 10); m = parseInt(parts[1], 10); }
        else { y = parseInt(parts[2], 10); m = parseInt(parts[1], 10); }
      }
    }
    if (m && y) {
      if (y < 100) y += 2000;
      return m >= 9 ? y : y - 1;
    }
    return null;
  };

  const filteredDons = useMemo(() => {
    if (anneeFiltre === 'TOTAL') return dons;
    return dons.filter(d => extractExercice(d.date) === Number(anneeFiltre));
  }, [dons, anneeFiltre]);

  const filteredTx = useMemo(() => {
    if (anneeFiltre === 'TOTAL') return transactionsGlobales;
    return (transactionsGlobales || []).filter(t => extractExercice(t.date) === Number(anneeFiltre));
  }, [transactionsGlobales, anneeFiltre]);

  // NOUVEAU : Statistiques annuelles (Pour la vue TOTAL)
  const yearlyStats = useMemo(() => {
    const statsObj = { 2021: 0, 2022: 0, 2023: 0, 2024: 0, 2025: 0, 2026: 0 };
    dons.forEach(d => {
      const ex = extractExercice(d.date);
      if (ex && statsObj[ex] !== undefined) {
        statsObj[ex] += (Number(d.montant) || 0);
      }
    });
    return Object.entries(statsObj)
      .map(([year, total]) => ({ year: Number(year), total }))
      .sort((a, b) => b.year - a.year); // Du plus récent au plus ancien
  }, [dons]);

  const stats = useMemo(() => {
    let priveTotal = 0; let proTotal = 0;
    const priveDonors = new Set(); const proDonors = new Set();
    const regPriveDonors = new Set(); const regProDonors = new Set();
    const apporteursMap = {};

    filteredDons.forEach(d => {
      const mt = Number(d.montant) || 0;
      const isPro = String(d.type).toLowerCase().includes('pro');
      const identifier = (d.nom + (d.prenom || '') + (d.mail || '')).toLowerCase().trim();
      const isRegulier = String(d.frequence).toLowerCase().includes('mensuel') || String(d.provenance).toLowerCase().includes('mensuel');
      const apporteurNom = String(d.apporteur || '').trim();

      if (isPro) {
        proTotal += mt; proDonors.add(identifier);
        if (isRegulier) regProDonors.add(identifier);
      } else {
        priveTotal += mt; priveDonors.add(identifier);
        if (isRegulier) regPriveDonors.add(identifier);
      }

      if (apporteurNom && apporteurNom.toLowerCase() !== 'non') {
        apporteursMap[apporteurNom] = (apporteursMap[apporteurNom] || 0) + mt;
      }
    });

    const topApporteurs = Object.entries(apporteursMap)
      .map(([nom, montant]) => ({ nom, montant })).sort((a, b) => b.montant - a.montant).slice(0, 3);

    const total = priveTotal + proTotal;
    return { total, priveTotal, proTotal, priveCount: priveDonors.size, proCount: proDonors.size, priveReguliers: regPriveDonors.size, proReguliers: regProDonors.size, topApporteurs };
  }, [filteredDons]);

  const pctProgression = budgetGoal > 0 ? Math.min((stats.total / budgetGoal) * 100, 100).toFixed(1) : 0;
  const resteCollecter = Math.max(0, budgetGoal - stats.total);
  const pctPrive = stats.total > 0 ? ((stats.priveTotal / stats.total) * 100).toFixed(0) : 0;
  const pctPro = stats.total > 0 ? ((stats.proTotal / stats.total) * 100).toFixed(0) : 0;

  // --- RAPPROCHEMENT COMPTABLE (Compte 754000) ---
  const totalGL754 = filteredTx.reduce((acc, t) => {
    let mt = 0;
    if (t.type === 'od') {
      if (t.compteCredit && String(t.compteCredit).startsWith('754')) mt += Math.abs(t.montant);
      if (t.compteDebit && String(t.compteDebit).startsWith('754')) mt -= Math.abs(t.montant);
    } else {
      if (String(t.compte).startsWith('754')) mt += (t.montant > 0 ? Math.abs(t.montant) : -Math.abs(t.montant));
    }
    return acc + mt;
  }, 0);
  const ecartComptable = Math.abs(stats.total - totalGL754);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.date || !formData.montant) return alert("Nom, Date et Montant requis.");
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'dons'), {
        ...formData, apporteur: formData.apporteur.trim(), montant: parseFloat(formData.montant), recu_emis: false, date_creation: new Date().toISOString()
      });
      alert("Don ajouté avec succès !");
      setFormData({ nom: '', prenom: '', type: 'Privé', frequence: 'Ponctuel', mail: '', adresse: '', date: '', montant: '', provenance: 'Virement', commentaire: '', apporteur: '' });
      setActiveView('dashboard');
    } catch (err) { alert("Erreur lors de l'ajout."); }
  };

  const handleDelete = async (id) => { if (window.confirm("Supprimer ce don de la base ?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dons', id)); };

  const handleImport = async (e, isHelloAsso) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const opts = isHelloAsso ? { defval: '' } : { header: 1, raw: true, defval: '' };
      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], opts);
      let count = 0; let doublons = 0;

      if (isHelloAsso) {
        for (const r of rawRows) {
          const statut = String(r['Statut du paiement'] || '').trim();
          const typeCampagne = String(r['Type'] || '').trim();
          if (statut === 'Payé' && typeCampagne.includes('Don')) {
            const mt = parseAmt(r['Montant total']);
            const dateStr = r['Date du paiement'] instanceof Date ? r['Date du paiement'].toISOString().split('T')[0] : r['Date du paiement'];
            const dateF = normaliserDateFR(dateStr);
            const nom = String(r['Nom payeur'] || '').trim();
            const freq = typeCampagne.toLowerCase().includes('mensuel') ? 'Mensuel' : 'Ponctuel';
            
            if (mt > 0 && !dons.some(d => d.nom === nom && d.date === dateF && d.montant === mt)) {
               await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'dons'), {
                 nom, prenom: r['Prénom payeur'] || '', mail: r['Email payeur'] || '', date: dateF, montant: mt, provenance: 'HelloAsso', type: 'Privé', frequence: freq, apporteur: '',
                 adresse: `${r['Adresse payeur'] || ''} ${r['Code Postal payeur'] || ''} ${r['Ville payeur'] || ''}`.trim(), recu_emis: true, date_creation: new Date().toISOString()
               });
               count++;
            } else { doublons++; }
          }
        }
      } else {
        const headers = rawRows[0];
        const iNom = headers.indexOf('Nom'); const iSoc = headers.indexOf('Société'); const iMt = headers.indexOf('Montant'); const iDate = headers.indexOf('Date versement');
        const iFreq = headers.indexOf('Fréquence'); const iApporteur = headers.indexOf('Famille') !== -1 ? headers.indexOf('Famille') : headers.indexOf('Apporteur');

        for (let i = 1; i < rawRows.length; i++) {
          const r = rawRows[i];
          const mt = parseAmt(r[iMt]);
          const nom = String(r[iNom] || r[iSoc] || '').trim();
          if (mt > 0 && nom) {
             const dateStr = r[iDate] instanceof Date ? r[iDate].toISOString().split('T')[0] : r[iDate];
             const dateF = normaliserDateFR(dateStr);
             const freq = iFreq !== -1 && r[iFreq] ? r[iFreq] : 'Ponctuel';
             const apporteurVal = iApporteur !== -1 && r[iApporteur] ? String(r[iApporteur]).trim() : '';

             if (!dons.some(d => d.nom === nom && d.date === dateF && d.montant === mt)) {
               await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'dons'), {
                 nom, prenom: r[headers.indexOf('Prénom')] || '', mail: r[headers.indexOf('Mail')] || '', date: dateF, montant: mt,
                 provenance: r[headers.indexOf('Provenance')] || 'Autre', type: r[headers.indexOf('Type')] || 'Privé', frequence: freq, apporteur: apporteurVal,
                 adresse: `${r[headers.indexOf('Adresse')] || ''} ${r[headers.indexOf('CP')] || ''} ${r[headers.indexOf('Ville')] || ''}`.trim(), 
                 recu_emis: r[headers.indexOf('N° Reçu fiscal')] ? true : false, date_creation: new Date().toISOString()
               });
               count++;
             } else { doublons++; }
          }
        }
      }
      alert(`${count} dons importés avec succès ! (${doublons} doublons ignorés)`);
      if (fileInputExcelRef.current) fileInputExcelRef.current.value = '';
      if (fileInputHelloAssoRef.current) fileInputHelloAssoRef.current.value = '';
    } catch(e) { alert("Erreur d'importation du fichier."); }
  };

  const markAsSent = async (id) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dons', id), { recu_emis: true }); };

  const generateCerfaDon = (don) => {
    if (!don.adresse || don.adresse.length < 5) return alert("L'adresse postale est obligatoire pour générer un Cerfa.");
    const win = window.open('', '_blank');
    const sigPresident = localStorage.getItem('sig_president') || '';
    const sigTresorier = localStorage.getItem('sig_tresorier') || '';
    const isAbandon = don.provenance === 'Abandon de frais';
    const natureCheck = isAbandon ? `<div class="checkbox">X</div><div>Autres (frais engagés par les bénévoles)</div>` : `<div class="checkbox">X</div><div>Numéraire</div>`;

    const html = `
      <html>
        <head>
          <title>Cerfa - ${don.nom}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; font-size: 13px; max-width: 800px; margin: 0 auto; }
            .box { border: 1px solid #000; padding: 15px; margin-bottom: 15px; }
            h1 { font-size: 16px; text-align: center; font-weight: bold; }
            .header-cerfa { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .cerfa-logo { font-weight: bold; font-size: 18px; border: 1px solid #000; padding: 5px 10px; }
            .row { display: flex; margin-bottom: 8px; }
            .label { width: 180px; font-weight: bold; }
            .val { flex-grow: 1; border-bottom: 1px dotted #000; padding-left: 5px; }
            .checkbox { width: 14px; height: 14px; border: 1px solid #000; display: inline-block; text-align: center; line-height: 14px; font-size: 12px; font-weight: bold; margin-right:5px; }
            @media print { .btn { display: none; } }
          </style>
        </head>
        <body>
          <div class="header-cerfa">
            <div><div class="cerfa-logo">cerfa</div><b>N° 11580*03</b><br/>DGFIP</div>
            <div style="text-align:center;"><h1>Reçu au titre des dons</h1><p>Articles 200, 238 bis et 885-0 V bis A du CGI</p></div>
            <div class="box">N° Ordre<br/><b>${new Date().getFullYear()}-${don.id.substring(0,6).toUpperCase()}</b></div>
          </div>
          <div class="box">
            <b>1. Bénéficiaire</b><br/><br/>
            <div class="row"><div class="label">Dénomination :</div><div class="val"><b>MON ECOLE EN DAUPHINE</b></div></div>
            <div class="row"><div class="label">Adresse :</div><div class="val">689 AV GENERAL DE GAULLE, 38110 LA TOUR-DU-PIN</div></div>
            <div class="row"><div class="label">N° RNA / SIRET :</div><div class="val">W382010595 / 923 490 411 00017</div></div>
            <div class="row"><div class="label">Objet :</div><div class="val">Enseignement primaire</div></div>
            <div style="margin-top:10px; display:flex; align-items:center;"><div class="checkbox">X</div>Oeuvre ou organisme d'intérêt général</div>
          </div>
          <div class="box">
            <b>2. Donateur</b><br/><br/>
            <div class="row"><div class="label">Nom et Prénom :</div><div class="val"><b>${don.nom} ${don.prenom}</b></div></div>
            <div class="row"><div class="label">Adresse :</div><div class="val">${don.adresse}</div></div>
          </div>
          <div style="margin:20px 0;">
            Le bénéficiaire reconnaît avoir reçu la somme de :<br/>
            <div class="row" style="margin-top:10px;"><div class="label">Chiffres :</div><div class="val"><b>*** ${formatMontant(don.montant)} euros ***</b></div></div>
            <div class="row" style="margin-top:10px;"><div class="label">Toutes lettres :</div><div class="val"><b>${nombreEnLettres(don.montant)}</b></div></div>
            <div class="row" style="margin-top:10px;"><div class="label">Date du don :</div><div class="val"><b>${normaliserDateFR(don.date)}</b></div></div>
          </div>
          <div class="box">
            <div style="display:flex; justify-content: space-between;">
              <div><b>Nature du don :</b><br/><br/><div style="display:flex; align-items:center;">${natureCheck}</div></div>
              <div><b>Forme :</b><br/><br/><div style="display:flex; align-items:center;"><div class="checkbox">X</div>Déclaration don manuel / Autres</div></div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 30px;">
            <div style="width: 45%; text-align: center;">
              <b>Le Trésorier</b><br/><br/>Le ${normaliserDateFR(new Date())}
              <div style="height: 80px; margin-top: 10px;">${sigTresorier ? `<img src="${sigTresorier}" style="max-height:100%; max-width:100%;" />` : ''}</div>
            </div>
            <div style="width: 45%; text-align: center;">
              <b>Le Président</b><br/><br/>Le ${normaliserDateFR(new Date())}
              <div style="height: 80px; margin-top: 10px;">${sigPresident ? `<img src="${sigPresident}" style="max-height:100%; max-width:100%;" />` : ''}</div>
            </div>
          </div>
          <button class="btn" style="display:block; width:200px; margin:30px auto; padding:10px; background:#4f46e5; color:#fff; text-align:center; border:none; border-radius:5px; cursor:pointer;" onclick="window.print()">Imprimer PDF</button>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    markAsSent(don.id);
  };

  const saveGoal = () => { setBudgetGoal(tempGoal); setIsEditingGoal(false); };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      <input type="file" accept=".xlsx,.xls" className="hidden" ref={fileInputExcelRef} onChange={(e) => handleImport(e, false)} />
      <input type="file" accept=".csv" className="hidden" ref={fileInputHelloAssoRef} onChange={(e) => handleImport(e, true)} />

      {/* NOUVEAU : ZONE DES ONGLETS ET FILTRE */}
      <div className="flex flex-col sm:flex-row bg-slate-100 p-1 rounded-xl w-fit mt-4 items-center gap-2 mx-auto sm:mx-0">
        <button onClick={() => setActiveView('dashboard')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'dashboard' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Tableau de bord & Base</button>
        <button onClick={() => setActiveView('saisie')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'saisie' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Saisie Manuelle (+)</button>
        
        <div className="hidden sm:block h-6 w-px bg-slate-300 mx-1"></div>
        
        <div className="flex items-center gap-2 px-2 py-1">
          <Calendar size={16} className="text-slate-500" />
          <select 
            value={anneeFiltre} 
            onChange={(e) => setAnneeFiltre(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="TOTAL" className="font-bold text-indigo-700">⭐ Toutes les années</option>
            <option disabled>──────────────</option>
            {[2021, 2022, 2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>Saison {year}-{year + 1}</option>
            ))}
          </select>
        </div>
      </div>

      {activeView === 'dashboard' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* AFFICHAGE CONDITIONNEL : HISTORIQUE vs ANNÉE SPÉCIFIQUE */}
          {anneeFiltre === 'TOTAL' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="flex justify-between items-end border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Historique des collectes par saison</h3>
                  <p className="text-xs text-slate-500 italic mt-1">Comparaison des dons reçus année par année</p>
                </div>
              </div>
              <div className="space-y-6">
                {yearlyStats.map(stat => {
                  const pct = budgetGoal > 0 ? Math.min((stat.total / budgetGoal) * 100, 100).toFixed(1) : 0;
                  return (
                    <div key={stat.year} className="group">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Saison {stat.year}-{stat.year + 1}</span>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-600">{formatMontant(stat.total)} €</span>
                          <span className="text-xs text-slate-400 ml-1">/ obj. {formatMontant(budgetGoal)} €</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-indigo-600 w-12 text-right">{pct}%</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                          <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                 <div className="flex flex-wrap items-center gap-4 md:gap-6">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Target size={12}/> Objectif</p>
                       {isEditingGoal ? (
                          <div className="flex items-center gap-2">
                            <input type="number" value={tempGoal} onChange={(e) => setTempGoal(Number(e.target.value))} className="w-24 border border-indigo-200 rounded px-2 py-0.5 text-sm font-black text-indigo-900 outline-none" autoFocus />
                            <button onClick={saveGoal} className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded font-bold hover:bg-indigo-700">OK</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-black text-indigo-900">{formatMontant(budgetGoal)} €</p>
                            <button onClick={() => setIsEditingGoal(true)} className="text-indigo-300 hover:text-indigo-600 transition-colors"><Edit2 size={12}/></button>
                          </div>
                        )}
                    </div>
                    <div className="hidden md:block h-8 w-px bg-slate-200"></div>
                    <div>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1"><Euro size={12}/> Collectés</p>
                       <p className="text-xl font-black text-emerald-700">{formatMontant(stats.total)} €</p>
                    </div>
                    <div className="hidden md:block h-8 w-px bg-slate-200"></div>
                    <div>
                       <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={12}/> Reste</p>
                       <p className="text-xl font-black text-rose-600">{formatMontant(resteCollecter)} €</p>
                    </div>
                 </div>
                 
                 <div className="flex gap-6 text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 w-full md:w-auto justify-end">
                    <div className="bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100/50">
                       <p className="text-[9px] font-bold text-blue-600 uppercase">Privé ({pctPrive}%)</p>
                       <p className="text-sm font-black text-slate-800">{formatMontant(stats.priveTotal)} €</p>
                    </div>
                    <div className="bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                       <p className="text-[9px] font-bold text-emerald-600 uppercase">Pro ({pctPro}%)</p>
                       <p className="text-sm font-black text-slate-800">{formatMontant(stats.proTotal)} €</p>
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-indigo-600 w-12 text-right">{pctProgression}%</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${pctProgression}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {/* WIDGETS D'ADMINISTRATION COMPACTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Contrôle Comptable (Rapprochement Filtré) */}
            <div className={`p-4 rounded-2xl shadow-sm border flex items-center gap-4 bg-white ${ecartComptable === 0 ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500 animate-pulse'}`}>
              <div className={`p-3 rounded-xl ${ecartComptable === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {ecartComptable === 0 ? <CheckCircle2 size={24}/> : <AlertTriangle size={24}/>}
              </div>
              <div>
                <h3 className={`text-[10px] font-bold uppercase tracking-wider ${ecartComptable === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Écart Cpt. 754000</h3>
                <p className={`text-xl font-black leading-none mt-1 ${ecartComptable === 0 ? 'text-slate-800' : 'text-rose-800'}`}>{formatMontant(ecartComptable)} €</p>
              </div>
            </div>

            {/* Top Ambassadeurs Compact */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 flex flex-col justify-center">
              <h4 className="text-[10px] font-black text-amber-800 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="text-amber-500" size={14} /> Top Ambassadeurs
              </h4>
              <div className="space-y-1.5">
                {stats.topApporteurs.length === 0 ? <p className="text-[10px] text-amber-600/70 italic">Aucun apporteur renseigné.</p> : null}
                {stats.topApporteurs.map((app, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-amber-100/50 pb-1 last:border-0 last:pb-0">
                    <span className="font-bold text-amber-900 truncate pr-2"><span className="text-amber-500 mr-1">#{idx + 1}</span> {app.nom}</span>
                    <span className="font-black text-amber-700 whitespace-nowrap">{formatMontant(app.montant)} €</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Imports */}
            <div className="bg-slate-900 p-4 rounded-2xl shadow-lg border border-slate-800 flex flex-col justify-center text-white">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Importations</h3>
              <div className="space-y-2">
                <button onClick={() => fileInputExcelRef.current.click()} className="w-full bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between transition-colors">
                  <span>Excel (Historique)</span> <FileSpreadsheet size={14}/>
                </button>
                <button onClick={() => fileInputHelloAssoRef.current.click()} className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/30 text-emerald-100 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between transition-colors">
                  <span>HelloAsso (CSV)</span> <Download size={14}/>
                </button>
              </div>
            </div>
          </div>

          {/* TABLEAU BASE DE DONNÉES FILTRÉ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-200 shadow-sm z-10">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Donateur</th>
                    <th className="p-4">Apporteur</th>
                    <th className="p-4 min-w-[200px]">Coordonnées (Cerfa)</th>
                    <th className="p-4">Provenance</th>
                    <th className="p-4 text-right">Montant</th>
                    <th className="p-4 text-center">Reçu Fiscal</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDons.map(don => (
                    <tr key={don.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-medium text-slate-600 whitespace-nowrap">{normaliserDateFR(don.date)}</td>
                      <td className="p-4 font-bold text-slate-800">
                        {don.nom} {don.prenom}
                        <span className="block mt-1 text-[9px] text-slate-400 font-medium">{don.type} - {don.frequence || 'Ponctuel'}</span>
                      </td>
                      <td className="p-4 font-semibold text-amber-600 truncate max-w-[120px]" title={don.apporteur}>{don.apporteur || '-'}</td>
                      <td className="p-4 text-slate-600">
                        <div className="truncate max-w-[200px]" title={don.adresse}>{don.adresse || <span className="italic text-rose-500 text-[10px]">Adresse manquante</span>}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{don.mail}</div>
                      </td>
                      <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-600 border border-slate-200">{don.provenance}</span></td>
                      <td className="p-4 text-right font-black text-indigo-700 whitespace-nowrap">{formatMontant(don.montant)} €</td>
                      <td className="p-4 text-center">
                        {don.provenance === 'HelloAsso' ? (
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold border border-emerald-100">Géré par HelloAsso</span>
                        ) : don.recu_emis ? (
                          <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 w-fit mx-auto border border-purple-100"><CheckCircle2 size={12}/> Émis</span>
                        ) : (
                          <button onClick={() => generateCerfaDon(don)} className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm flex items-center justify-center gap-1 mx-auto active:scale-95">
                            <FileSignature size={12}/> Créer Cerfa
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDelete(don.id)} className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                  {filteredDons.length === 0 && <tr><td colSpan="8" className="p-10 text-center text-slate-400 italic">Aucun don enregistré pour cette période.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === 'saisie' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto animate-fade-in mt-4">
          <h3 className="font-black text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">Enregistrer un nouveau don</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom *</label>
                <input type="text" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Prénom</label>
                <input type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Privé">Privé</option><option value="Professionnel">Professionnel</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fréquence</label>
                <select value={formData.frequence} onChange={e => setFormData({...formData, frequence: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Ponctuel">Ponctuel</option><option value="Mensuel">Mensuel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Adresse Postale * (Pour le Cerfa)</label>
              <input type="text" required value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} placeholder="Ex: 12 rue de la Paix, 38110 La Tour-du-Pin" className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Montant (€) *</label>
                <input type="number" step="0.01" required value={formData.montant} onChange={e => setFormData({...formData, montant: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date *</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Provenance</label>
                <select value={formData.provenance} onChange={e => setFormData({...formData, provenance: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Virement">Virement Bancaire</option><option value="Chèque">Chèque</option><option value="Espèces">Espèces</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">E-mail</label>
                <input type="email" value={formData.mail} onChange={e => setFormData({...formData, mail: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-600 uppercase mb-2">Apporteur (Famille)</label>
                <input type="text" placeholder="Ex: DUPONT" value={formData.apporteur} onChange={e => setFormData({...formData, apporteur: e.target.value})} className="w-full border border-amber-200 bg-amber-50/50 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
              <PlusCircle size={18}/> Enregistrer dans la base
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- MODULE : ACCUEIL FAMILLE (Tableau de Bord Parents) ---
const AccueilFamille = () => {
  const [dons, setDons] = useState([]);
  const budgetGoal = 58724; // L'objectif que vous aviez fixé

  // Récupération des dons en temps réel pour la jauge
  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'dons');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste = [];
      snapshot.forEach((doc) => { liste.push({ id: doc.id, ...doc.data() }); });
      setDons(liste);
    });
    return () => unsubscribe();
  }, []);

  // Calculs pour la jauge
  const totalDons = dons.reduce((acc, d) => acc + (Number(d.montant) || 0), 0);
  const pctProgression = budgetGoal > 0 ? Math.min((totalDons / budgetGoal) * 100, 100).toFixed(2) : 0;
  const resteCollecter = Math.max(0, budgetGoal - totalDons);
  const formatMontant = (val) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

  // Données fictives (Trombinoscope)
  const equipe = [
    { nom: "Laurence Gérard", role: "Direction", img: "https://ui-avatars.com/api/?name=Laurence+Gérard&background=4f46e5&color=fff&size=128" },
    { nom: "Cécile Sublet", role: "Enseignante", img: "https://ui-avatars.com/api/?name=Cécile+Sublet&background=0ea5e9&color=fff&size=128" },
    { nom: "Florence Hervet", role: "Enseignante", img: "https://ui-avatars.com/api/?name=Florence+ Hervet&background=10b981&color=fff&size=128" },
    { nom: "Laurent Fauvain", role: "Président Asso.", img: "https://ui-avatars.com/api/?name=Laurent+Fauvain&background=8b5cf6&color=fff&size=128" },
    { nom: "Louis-Vianney Le Lézec", role: "Trésorier", img: "https://ui-avatars.com/api/?name=Le+Lezec&background=f59e0b&color=fff&size=128" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans animate-fade-in">
      
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-md text-white flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black mb-2">Bienvenue sur le portail Familles</h1>
          <p className="text-blue-100 text-sm">Toutes les informations, plannings et actualités du Cours Tom Morel centralisées ici.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNE GAUCHE (Plus large) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ACTUALITÉS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Megaphone className="text-indigo-500" size={20} /> Le mot de l'équipe
            </h2>
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
              <h3 className="font-bold text-indigo-900 mb-2">Préparation de la rentrée 2026/2027</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chers parents, nous sommes impatients de retrouver vos enfants. N'oubliez pas de vérifier vos plannings de ménage et de cantine dans le menu de gauche. Les fournitures scolaires ont été commandées.
              </p>
              <p className="text-xs text-slate-400 mt-3 text-right">Publié par La Direction, hier à 14:30</p>
            </div>
          </div>

          {/* JAUGE DES DONS (Design type HelloAsso/Dashboard) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Target className="text-rose-500" size={20} /> Objectif de la Période 2025/2026
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Objectif</span>
                <p className="text-xl font-black text-indigo-600">{formatMontant(budgetGoal)} €</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Dons Actuels</span>
                <p className="text-xl font-black text-emerald-700">{formatMontant(totalDons)} €</p>
              </div>
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
                <span className="text-[10px] font-bold text-rose-600 uppercase">Reste à collecter</span>
                <p className="text-xl font-black text-rose-700">{formatMontant(resteCollecter)} €</p>
              </div>
            </div>

            <div className="mb-2 flex justify-between items-end">
              <span className="text-xs font-bold text-slate-500">Progression de l'Objectif :</span>
              <span className="text-xl font-black text-indigo-600">{pctProgression}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${pctProgression}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-400">
              <span>0 €</span>
              <span>{formatMontant(budgetGoal)} €</span>
            </div>
          </div>

          {/* TROMBINOSCOPE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Users className="text-emerald-500" size={20} /> L'équipe (Trombinoscope)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {equipe.map((membre, idx) => (
                <div key={idx} className="flex flex-col items-center p-3 hover:bg-slate-50 rounded-xl transition-colors text-center border border-transparent hover:border-slate-100">
                  <img src={membre.img} alt={membre.nom} className="w-16 h-16 rounded-full shadow-sm mb-3 border-2 border-white" />
                  <span className="text-sm font-bold text-slate-800 leading-tight">{membre.nom}</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">{membre.role}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* COLONNE DROITE (Plus fine) */}
        <div className="space-y-6">
          
          {/* RAPPELS RAPIDES */}
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 bg-gradient-to-b from-white to-rose-50/30">
            <h2 className="text-sm font-bold text-rose-800 flex items-center gap-2 mb-4 border-b border-rose-100 pb-3">
              <Bell className="text-rose-500" size={18} /> Rappels importants
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-600 bg-white p-3 rounded-xl border border-rose-100 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                <span>Merci de remplir les <b>fiches travaux</b> avant le 15 Septembre.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-600 bg-white p-3 rounded-xl border border-rose-100 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                <span>Pensez à vérifier vos créneaux pour le <b>ménage du week-end</b>.</span>
              </li>
            </ul>
          </div>

          {/* ÉVÉNEMENTS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Calendar className="text-blue-500" size={18} /> Prochains événements
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-center group">
                <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-center min-w-[50px] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span className="block text-xs font-bold uppercase">Sep</span>
                  <span className="block text-lg font-black">12</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Réunion de Rentrée</h4>
                  <p className="text-xs text-slate-500 mt-0.5">18h30 - Salles de classe</p>
                </div>
              </div>
              <div className="flex gap-4 items-center group">
                <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-center min-w-[50px] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span className="block text-xs font-bold uppercase">Oct</span>
                  <span className="block text-lg font-black">20</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Cross de l'école</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Matinée - Stade municipal</p>
                </div>
              </div>
              <div className="flex gap-4 items-center group">
                <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-center min-w-[50px] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span className="block text-xs font-bold uppercase">Déc</span>
                  <span className="block text-lg font-black">15</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Fête de Noël</h4>
                  <p className="text-xs text-slate-500 mt-0.5">16h00 - Cour de récréation</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-5 bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold transition-colors">
              Voir tout l'agenda
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- MODULE : GESTION DES ÉVÉNEMENTS ---
const GestionEvenements = () => {
  const [activeView, setActiveView] = useState('organisation');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 font-sans animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-indigo-600" /> Événements & Rentabilité
          </h2>
          <p className="text-slate-500 text-sm mt-1">Organisation des manifestations et suivi du bilan financier.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveView('organisation')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'organisation' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Organisation</button>
          <button onClick={() => setActiveView('rentabilite')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'rentabilite' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Bilan Financier</button>
        </div>
      </div>

      {activeView === 'organisation' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center py-16 animate-fade-in">
          <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Calendrier des Événements</h2>
          <p className="text-slate-500">Le module de création et de gestion des événements (Kermesse, Marché de Noël...) est en cours de développement.</p>
        </div>
      )}

      {activeView === 'rentabilite' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center py-16 animate-fade-in">
          <TrendingUp className="mx-auto text-slate-300 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Rentabilité de l'événement</h2>
          <p className="text-slate-500">Le tableau de bord d'analyse financière (Dépenses vs Recettes liées à un événement) est en cours de développement.</p>
        </div>
      )}
    </div>
  );
};

export default function App() {
  // 1. On lit l'URL pour voir si on ouvre un nouvel onglet sur un module précis
const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'accueil_famille'; 
  });
  
  const [transactionsGlobales, setTransactionsGlobales] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchTx = () => {
      const q = collection(db, 'artifacts', appId, 'public', 'data', 'transactions');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const txs = [];
        snapshot.forEach((doc) => {
          txs.push({ id: doc.id, ...doc.data() });
        });
        setTransactionsGlobales(txs);
      });
      return unsubscribe;
    };
    const unsub = fetchTx();
    return () => unsub();
  }, []);

  // 2. Si l'utilisateur utilise les flèches "Précédent/Suivant" du navigateur
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'vie_ecole': return <VieEcole />;
      case 'accueil_famille': return <AccueilFamille />;
      case 'contact': return <InfosContact />;
      case 'etat_financier': return <EtatFinancier transactionsGlobales={transactionsGlobales} />;
      case 'grand_livre': return <GrandLivre transactionsGlobales={transactionsGlobales} />;
      case 'plan_comptable': return <PlanComptable />;
      case 'tableau_bord': return <TableauBord transactionsGlobales={transactionsGlobales} />;
      case 'scolarite': return <PlaceholderPage title="Scolarité" />;
      case 'factures_parents': return <PlaceholderPage title="Mes Factures (Parents)" />;
      case 'plannings': return <ModulePlannings defaultTab="cantine" />;
      case 'fiche_travaux': return <FicheTravaux />;
      case 'budget': return <BudgetPrevisionnel transactionsGlobales={transactionsGlobales} />;
      case 'notes_frais': return <NotesFrais transactionsGlobales={transactionsGlobales} />;
      case 'dons_recus': return <DonsRecus transactionsGlobales={transactionsGlobales} />;
      case 'evenements': return <GestionEvenements />;
      case 'gestion_acces': return <PlaceholderPage title="Gestion des Accès" />;
      case 'factures_familles': return <PlaceholderPage title="Factures Familles (Admin)" />;
      case 'equipe_contrats': return <PlaceholderPage title="Équipe et Contrats" />;
      case 'uniformes_stock': return <PlaceholderPage title="Uniformes & Stock" />;
      default: return <PlaceholderPage title="Module en construction" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 relative">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col items-center border-b border-slate-800 shrink-0">
          <div className="bg-white p-2 rounded-xl mb-3 shadow-lg">
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-white font-bold text-lg text-center leading-tight">Cours<br/>Tom Morel</h1>
          <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-semibold">ERP - Admin</p>
        </div>

        {/* 3. Tous les boutons deviennent de VRAIS liens (<a>) avec un href */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Espace Famille</h3>
            <a href="#accueil_famille" onClick={() => handleNavigation('accueil_famille')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'accueil_famille' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <LayoutDashboard size={18} /> Accueil
            </a>
            <a href="#vie_ecole" onClick={() => handleNavigation('vie_ecole')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'vie_ecole' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Newspaper size={18} /> Vie de l'école
            </a>
            <a href="#scolarite" onClick={() => handleNavigation('scolarite')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'scolarite' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <GraduationCap size={18} /> Scolarité
            </a>
            <a href="#factures_parents" onClick={() => handleNavigation('factures_parents')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'factures_parents' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Receipt size={18} /> Mes Factures
            </a>
            {/* Infos & Contact est maintenant en dernier */}
            <a href="#contact" onClick={() => handleNavigation('contact')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'contact' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Info size={18} /> Infos & Contact
            </a>
          </div>
          
         <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Plannings Parents</h3>
            
            {/* NOUVEAU : Bouton unifié pour tous les plannings */}
            <a href="#plannings" onClick={() => handleNavigation('plannings')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'plannings' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Calendar size={18} /> Plannings Cantine & Ménage
            </a>
            
            <a href="#fiche_travaux" onClick={() => handleNavigation('fiche_travaux')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'fiche_travaux' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Hammer size={18} /> Fiche Travaux
            </a>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Pilotage</h3>
            <a href="#tableau_bord" onClick={() => handleNavigation('tableau_bord')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'tableau_bord' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <LayoutDashboard size={18} /> Tableau de Bord
            </a>
            <a href="#etat_financier" onClick={() => handleNavigation('etat_financier')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'etat_financier' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <PieChart size={18} /> État Financier
            </a>
          </div>

<div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Compta & Finances</h3>
            <a href="#grand_livre" onClick={() => handleNavigation('grand_livre')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'grand_livre' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <BookOpen size={18} /> Grand Livre
            </a>
            <a href="#plan_comptable" onClick={() => handleNavigation('plan_comptable')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'plan_comptable' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <FileSignature size={18} /> Plan Comptable
            </a>
            <a href="#budget" onClick={() => handleNavigation('budget')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'budget' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Target size={18} /> Budget
            </a>
            <a href="#notes_frais" onClick={() => handleNavigation('notes_frais')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'notes_frais' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <FileText size={18} /> Notes de Frais
            </a>
            <a href="#dons_recus" onClick={() => handleNavigation('dons_recus')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'dons_recus' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Heart size={18} /> Dons et reçus fiscaux
            </a>
            {/* Le module unifié des Événements est maintenant ici : */}
            <a href="#evenements" onClick={() => handleNavigation('evenements')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'evenements' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Calendar size={18} /> Événements
            </a>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Administration</h3>
            <a href="#gestion_acces" onClick={() => handleNavigation('gestion_acces')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'gestion_acces' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Lock size={18} /> Gestion Accès
            </a>
            <a href="#factures_familles" onClick={() => handleNavigation('factures_familles')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'factures_familles' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <FileSpreadsheet size={18} /> Factures Familles
            </a>
            <a href="#equipe_contrats" onClick={() => handleNavigation('equipe_contrats')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'equipe_contrats' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Users size={18} /> Équipe (Contrats)
            </a>
            <a href="#uniformes_stock" onClick={() => handleNavigation('uniformes_stock')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'uniformes_stock' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Package size={18} /> Uniformes & Stock
            </a>
          </div>

        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="font-semibold text-slate-800 hidden sm:block">
              {activeTab.replace(/_/g, ' ').toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-slate-800">Admin</div>
              <div className="text-xs text-slate-500">Profil : Direction</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border-2 border-indigo-200">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}
