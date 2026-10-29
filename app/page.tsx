"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Meeting = { id: string; title: string; date: string; time: string; duration: number; place: string; notes: string; reminder: number };
type Task = { id: string; title: string; due: string; done: boolean };
type Training = { id: string; title: string; client: string; status: string; notes: string };

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const tomorrow = () => {
  const d = new Date(); d.setDate(d.getDate()+1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const id = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function Home() {
  const [section, setSection] = useState("inicio");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [ready, setReady] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [notice, setNotice] = useState("");
  const [meetingForm, setMeetingForm] = useState({ title:"", date:today(), time:"10:00", duration:"60", place:"", notes:"", reminder:"15" });
  const [taskForm, setTaskForm] = useState({ title:"", due:today() });
  const [trainingForm, setTrainingForm] = useState({ title:"", client:"", status:"Pendiente", notes:"" });

  useEffect(() => {
    try {
      const savedMeetings = localStorage.getItem("apf-demo-meetings");
      const savedTasks = localStorage.getItem("apf-demo-tasks");
      const savedTrainings = localStorage.getItem("apf-demo-trainings");
      if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedTrainings) setTrainings(JSON.parse(savedTrainings));
    } catch { /* Ignore invalid demo data and keep the app usable. */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("apf-demo-meetings", JSON.stringify(meetings)); }, [meetings, ready]);
  useEffect(() => { if (ready) localStorage.setItem("apf-demo-tasks", JSON.stringify(tasks)); }, [tasks, ready]);
  useEffect(() => { if (ready) localStorage.setItem("apf-demo-trainings", JSON.stringify(trainings)); }, [trainings, ready]);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      meetings.forEach((m) => {
        const start = new Date(`${m.date}T${m.time}:00`).getTime();
        const remindAt = start - m.reminder * 60_000;
        const key = `apf-reminded-${m.id}`;
        if (Number.isFinite(start) && now.getTime() >= remindAt && now.getTime() < start && !sessionStorage.getItem(key)) {
          setNotice(`Recordatorio: “${m.title}” empieza en ${m.reminder} minutos.`);
          sessionStorage.setItem(key, "1");
        }
      });
    };
    check();
    const timer = window.setInterval(check, 30_000);
    return () => window.clearInterval(timer);
  }, [meetings]);

  const sortedMeetings = useMemo(() => [...meetings].sort((a,b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)), [meetings]);
  const upcoming = sortedMeetings.filter(m => new Date(`${m.date}T${m.time}:00`).getTime() >= Date.now() - 60*60*1000);
  const pendingTasks = tasks.filter(t => !t.done);
  const todayMeetings = upcoming.filter(m => m.date === today());
  const fmtDate = (value:string) => {
    if (!value) return "Sin fecha";
    return new Date(`${value}T12:00:00`).toLocaleDateString("es-ES",{weekday:"short",day:"numeric",month:"short"});
  };

  function addMeeting(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMeetings(prev => [...prev, { ...meetingForm, id:id(), duration:Number(meetingForm.duration)||60, reminder:Number(meetingForm.reminder) }]);
    setMeetingForm({ title:"", date:today(), time:"10:00", duration:"60", place:"", notes:"", reminder:"15" });
    setShowMeeting(false); setSection("agenda"); setNotice("Reunión guardada en este navegador.");
  }
  function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!taskForm.title.trim()) return;
    setTasks(prev => [...prev, { ...taskForm, id:id(), done:false }]);
    setTaskForm({ title:"", due:today() }); setShowTask(false); setNotice("Tarea guardada.");
  }
  function addTraining(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!trainingForm.title.trim()) return;
    setTrainings(prev => [...prev, { ...trainingForm, id:id() }]);
    setTrainingForm({ title:"", client:"", status:"Pendiente", notes:"" }); setShowTraining(false); setNotice("Formación guardada en este navegador.");
  }
  function clearDemoData() {
    if (!window.confirm("¿Quieres borrar del navegador todas las reuniones, tareas y formaciones de prueba? Esta acción no se puede deshacer.")) return;
    setMeetings([]);
    setTasks([]);
    setTrainings([]);
    Object.keys(sessionStorage)
      .filter(key => key.startsWith("apf-reminded-"))
      .forEach(key => sessionStorage.removeItem(key));
    setNotice("Se han borrado los datos de prueba de este navegador.");
  }

  const nav = [
    { id:"inicio", label:"Inicio", icon:"⌂" },
    { id:"agenda", label:"Mi agenda", icon:"▦" },
    { id:"formaciones", label:"Mis formaciones", icon:"▤" },
    { id:"tareas", label:"Tareas", icon:"✓" },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(e)=>{e.preventDefault();setSection("inicio")}}>
          <span className="brand-mark">AF</span><span>asistente<strong> personal</strong></span>
        </a>
        <div className="side-caption">ESPACIO PERSONAL</div>
        <nav className="side-nav" aria-label="Navegación principal">
          {nav.map(item => <button key={item.id} className={section===item.id?"nav-item active":"nav-item"} onClick={()=>setSection(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}{item.id==="tareas"&&pendingTasks.length>0&&<span className="nav-count">{pendingTasks.length}</span>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <span className="secure-dot" /> Prototipo personal
          <p>Los datos de prueba se guardan solo en este navegador.</p>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Asistente personal <span>/</span> {nav.find(n=>n.id===section)?.label || "Inicio"}</div>
          <div className="topbar-right"><span className="today-label">{new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"})}</span><span className="avatar">A</span></div>
        </header>

        {notice && <div className="notice" role="status"><span>ⓘ</span>{notice}<button aria-label="Cerrar aviso" onClick={()=>setNotice("")}>×</button></div>}

        {section==="inicio" && <div className="content">
          <div className="welcome-row"><div><p className="eyebrow">TU ESPACIO DE TRABAJO</p><h1>Hola, vamos a ponerlo <em>todo en orden.</em></h1><p className="subheading">Reuniones, formaciones y tareas importantes, en un solo lugar.</p></div><button className="button-primary" onClick={()=>setShowMeeting(true)}><span>＋</span> Añadir reunión</button></div>
          <div className="stats-grid">
            <article className="stat-card"><div className="stat-top"><span>Reuniones hoy</span><span className="stat-icon lilac">◷</span></div><strong>{todayMeetings.length.toString().padStart(2,"0")}</strong><small>En tu agenda personal</small></article>
            <article className="stat-card"><div className="stat-top"><span>Formaciones activas</span><span className="stat-icon green">▤</span></div><strong>{trainings.filter(t=>t.status==="En curso").length.toString().padStart(2,"0")}</strong><small>{trainings.length} registradas en total</small></article>
            <article className="stat-card"><div className="stat-top"><span>Tareas pendientes</span><span className="stat-icon orange">✓</span></div><strong>{pendingTasks.length.toString().padStart(2,"0")}</strong><small>Por completar</small></article>
          </div>
          <div className="dashboard-grid">
            <section className="panel agenda-panel"><div className="panel-heading"><div><p className="section-kicker">TU DÍA</p><h2>Próximas reuniones</h2></div><button className="text-button" onClick={()=>setSection("agenda")}>Ver agenda ↗</button></div>
              {upcoming.slice(0,4).map(m=><article className="meeting-row" key={m.id}><div className="meeting-date"><strong>{m.date===today()?"HOY":fmtDate(m.date).split(" ")[0].toUpperCase()}</strong><span>{m.date===today()?m.time:fmtDate(m.date).split(" ").slice(1).join(" ")}</span></div><div className="meeting-info"><strong>{m.title}</strong><span>{m.place||"Sin ubicación"} · {m.duration} min</span></div><span className="reminder-chip">{m.reminder} min antes</span><button className="delete-button" aria-label={"Eliminar "+m.title} onClick={()=>setMeetings(prev=>prev.filter(x=>x.id!==m.id))}>×</button></article>)}
              {upcoming.length===0&&<div className="empty-state"><span className="empty-icon">◷</span><strong>Tu agenda empieza aquí</strong><p>Añade una reunión y te ayudaremos a tenerla presente.</p><button className="button-secondary" onClick={()=>setShowMeeting(true)}>＋ Añadir primera reunión</button></div>}
            </section>
            <section className="panel tasks-panel"><div className="panel-heading"><div><p className="section-kicker">NO LO DEJES PARA DESPUÉS</p><h2>Mis tareas</h2></div><button className="icon-button" aria-label="Añadir tarea" onClick={()=>setShowTask(true)}>＋</button></div>
              {pendingTasks.slice(0,5).map(t=><label className="task-row" key={t.id}><input type="checkbox" checked={t.done} onChange={e=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,done:e.target.checked}:x))}/><span className="task-copy"><strong>{t.title}</strong><small>Fecha límite: {fmtDate(t.due)}</small></span></label>)}
              {pendingTasks.length===0&&<div className="empty-state compact"><span className="empty-icon">✓</span><strong>Todo despejado</strong><p>Añade tareas para llevar el seguimiento de tus gestiones.</p></div>}
              <button className="button-secondary full-button" onClick={()=>{setSection("tareas");setShowTask(true)}}>＋ Añadir tarea</button>
            </section>
          </div>
          <section className="quick-actions"><div><p className="section-kicker">ACCESOS RÁPIDOS</p><h2>¿Qué necesitas hacer?</h2></div><div className="quick-grid"><button onClick={()=>setShowMeeting(true)}><span className="quick-icon lilac">◷</span><span><strong>Programar reunión</strong><small>Guarda una fecha y un recordatorio</small></span><b>↗</b></button><button onClick={()=>setShowTraining(true)}><span className="quick-icon green">▤</span><span><strong>Registrar formación</strong><small>Abre una ficha de seguimiento</small></span><b>↗</b></button><button onClick={()=>{setSection("tareas");setShowTask(true)}}><span className="quick-icon orange">✓</span><span><strong>Añadir tarea</strong><small>Apunta una gestión pendiente</small></span><b>↗</b></button></div></section>
          <div className="prototype-note"><span>ⓘ</span><p><strong>Prototipo:</strong> las fichas permanecen en este navegador, sin cifrado propio ni sincronización. El acceso al sitio está restringido; aun así, utiliza datos ficticios y no registres datos identificativos de alumnos hasta que se active almacenamiento de servidor con controles de acceso.</p><button type="button" className="button-secondary" onClick={clearDemoData}>Borrar datos de prueba</button></div>
        </div>}

        {section==="agenda" && <div className="content">
          <div className="page-title-row"><div><p className="eyebrow">TU ORGANIZACIÓN</p><h1>Mi agenda</h1><p className="subheading">Añade tus reuniones manualmente y configura los recordatorios.</p></div><button className="button-primary" onClick={()=>setShowMeeting(true)}>＋ Añadir reunión</button></div>
          <section className="panel list-panel"><div className="panel-heading"><div><p className="section-kicker">COMPROMISOS REGISTRADOS</p><h2>Próximas reuniones</h2></div><span className="pill">{upcoming.length} reuniones</span></div>
          {sortedMeetings.map(m=><article className="meeting-row agenda-full-row" key={m.id}><div className="meeting-date"><strong>{fmtDate(m.date).split(" ")[0].toUpperCase()}</strong><span>{m.time}</span></div><div className="meeting-info"><strong>{m.title}</strong><span>{fmtDate(m.date)} · {m.duration} min · {m.place||"Sin ubicación"}</span>{m.notes&&<small>{m.notes}</small>}</div><span className="reminder-chip">{m.reminder} min antes</span><button className="delete-button" onClick={()=>setMeetings(prev=>prev.filter(x=>x.id!==m.id))} aria-label={"Eliminar "+m.title}>×</button></article>)}
          {sortedMeetings.length===0&&<div className="empty-state"><span className="empty-icon">◷</span><strong>No has añadido reuniones</strong><p>Cuando registres una reunión, aparecerá aquí.</p><button className="button-secondary" onClick={()=>setShowMeeting(true)}>＋ Añadir reunión</button></div>}
          </section>
        </div>}

        {section==="formaciones" && <div className="content">
          <div className="page-title-row"><div><p className="eyebrow">SEGUIMIENTO PERSONAL</p><h1>Mis formaciones</h1><p className="subheading">Registra las formaciones que te asignan y añade notas iniciales.</p></div><button className="button-primary" onClick={()=>setShowTraining(true)}>＋ Nueva formación</button></div>
          <section className="panel list-panel"><div className="panel-heading"><div><p className="section-kicker">TU HISTORIAL</p><h2>Formaciones registradas</h2></div><span className="pill">{trainings.length} formaciones</span></div>
          {trainings.map(t=><article className="training-row" key={t.id}><div className="training-mark">F</div><div className="training-info"><strong>{t.title}</strong><span>{t.client||"Sin cliente indicado"}</span>{t.notes&&<small>{t.notes}</small>}</div><select value={t.status} aria-label={"Estado de "+t.title} onChange={e=>setTrainings(prev=>prev.map(x=>x.id===t.id?{...x,status:e.target.value}:x))}><option>Pendiente</option><option>En curso</option><option>Completada</option><option>Cancelada</option></select><button className="delete-button" aria-label={"Eliminar "+t.title} onClick={()=>setTrainings(prev=>prev.filter(x=>x.id!==t.id))}>×</button></article>)}
          {trainings.length===0&&<div className="empty-state"><span className="empty-icon">▤</span><strong>Aún no hay formaciones</strong><p>Registra una formación para empezar a organizar sus notas y seguimiento.</p><button className="button-secondary" onClick={()=>setShowTraining(true)}>＋ Registrar formación</button></div>}
          </section>
        </div>}

        {section==="tareas" && <div className="content">
          <div className="page-title-row"><div><p className="eyebrow">ORGANIZA TUS GESTIONES</p><h1>Mis tareas</h1><p className="subheading">Ten a mano las cosas que necesitas completar.</p></div><button className="button-primary" onClick={()=>setShowTask(true)}>＋ Añadir tarea</button></div>
          <section className="panel list-panel"><div className="panel-heading"><div><p className="section-kicker">LISTA PERSONAL</p><h2>Tareas pendientes y completadas</h2></div><span className="pill">{pendingTasks.length} pendientes</span></div>
          {tasks.map(t=><div className={"task-row task-list-row "+(t.done?"task-done":"")} key={t.id}><input type="checkbox" checked={t.done} onChange={e=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,done:e.target.checked}:x))}/><span className="task-copy"><strong>{t.title}</strong><small>Fecha límite: {fmtDate(t.due)}</small></span><button className="delete-button" aria-label={"Eliminar "+t.title} onClick={()=>setTasks(prev=>prev.filter(x=>x.id!==t.id))}>×</button></div>)}
          {tasks.length===0&&<div className="empty-state"><span className="empty-icon">✓</span><strong>No hay tareas todavía</strong><p>Añade una gestión pendiente para empezar.</p><button className="button-secondary" onClick={()=>setShowTask(true)}>＋ Añadir tarea</button></div>}
          </section>
        </div>}
      </section>

      {(showMeeting||showTask||showTraining)&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget){setShowMeeting(false);setShowTask(false);setShowTraining(false)}}}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-header"><div><p className="section-kicker">ASISTENTE PERSONAL</p><h2 id="modal-title">{showMeeting?"Añadir reunión":showTask?"Añadir tarea":"Registrar formación"}</h2></div><button className="icon-button" onClick={()=>{setShowMeeting(false);setShowTask(false);setShowTraining(false)}} aria-label="Cerrar">×</button></div>
          {showMeeting&&<form onSubmit={addMeeting} className="form-stack"><label>Título de la reunión<input required autoFocus value={meetingForm.title} onChange={e=>setMeetingForm({...meetingForm,title:e.target.value})} placeholder="Ej. Revisión de proyecto"/></label><div className="form-grid"><label>Fecha<input required type="date" value={meetingForm.date} onChange={e=>setMeetingForm({...meetingForm,date:e.target.value})}/></label><label>Hora<input required type="time" value={meetingForm.time} onChange={e=>setMeetingForm({...meetingForm,time:e.target.value})}/></label><label>Duración (minutos)<input min="5" step="5" type="number" value={meetingForm.duration} onChange={e=>setMeetingForm({...meetingForm,duration:e.target.value})}/></label><label>Recordatorio<select value={meetingForm.reminder} onChange={e=>setMeetingForm({...meetingForm,reminder:e.target.value})}><option value="5">5 minutos antes</option><option value="15">15 minutos antes</option><option value="30">30 minutos antes</option><option value="60">1 hora antes</option></select></label></div><label>Ubicación o enlace<input value={meetingForm.place} onChange={e=>setMeetingForm({...meetingForm,place:e.target.value})} placeholder="Sala, dirección o enlace"/></label><label>Notas (opcional)<textarea rows={3} value={meetingForm.notes} onChange={e=>setMeetingForm({...meetingForm,notes:e.target.value})} placeholder="Temas a tratar..."/></label><div className="modal-actions"><button type="button" className="button-secondary" onClick={()=>setShowMeeting(false)}>Cancelar</button><button className="button-primary" type="submit">Guardar reunión</button></div></form>}
          {showTask&&<form onSubmit={addTask} className="form-stack"><label>¿Qué tienes que hacer?<input required autoFocus value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})} placeholder="Ej. Enviar correo de cierre"/></label><label>Fecha límite<input required type="date" value={taskForm.due} onChange={e=>setTaskForm({...taskForm,due:e.target.value})}/></label><div className="modal-actions"><button type="button" className="button-secondary" onClick={()=>setShowTask(false)}>Cancelar</button><button className="button-primary" type="submit">Guardar tarea</button></div></form>}
          {showTraining&&<form onSubmit={addTraining} className="form-stack"><label>Nombre de la formación<input required autoFocus value={trainingForm.title} onChange={e=>setTrainingForm({...trainingForm,title:e.target.value})} placeholder="Ej. SOLIDWORKS Electrical básico"/></label><label>Cliente (opcional)<input value={trainingForm.client} onChange={e=>setTrainingForm({...trainingForm,client:e.target.value})} placeholder="Empresa o cliente"/></label><label>Estado<select value={trainingForm.status} onChange={e=>setTrainingForm({...trainingForm,status:e.target.value})}><option>Pendiente</option><option>En curso</option><option>Completada</option><option>Cancelada</option></select></label><label>Notas iniciales<textarea rows={3} value={trainingForm.notes} onChange={e=>setTrainingForm({...trainingForm,notes:e.target.value})} placeholder="Objetivos, temas o detalles..."/></label><div className="modal-actions"><button type="button" className="button-secondary" onClick={()=>setShowTraining(false)}>Cancelar</button><button className="button-primary" type="submit">Guardar formación</button></div></form>}
        </section>
      </div>}
    </main>
  );
}
