import { Download, FileJson, Printer, ShieldCheck, Lock, Sparkles, Search, Wand2 } from 'lucide-react'

export default function ScheduleToolbar({
  coverage,
  autoFillCount = 0,
  availability,
  lastExportType,
  onAutoFill,
  onExportCsv,
  onExportJson,
  onPrint,
}) {
  return (
    <div className="toolbar-shell no-print-border-fix">
      <div>
        <div className="eyebrow">Weekly schedule</div>
        <div className="title-row">
          <h1>March 15 – March 21, 2026</h1>
          <div className="chip-row">
            <span className="chip muted">Draft</span>
            <span className="chip">{coverage.totalAssigned} assigned</span>
            <span className="chip warning">{coverage.open} open</span>
            <span className="chip">Coverage {coverage.coverage}%</span>
            <span className="chip">{availability.totalBlocks} blocked days</span>
            <span className="chip">Sunday–Saturday</span>
            {autoFillCount > 0 && <span className="chip success">Auto-filled {autoFillCount}</span>}
            {lastExportType && <span className="chip export-chip">{lastExportType}</span>}
          </div>
        </div>
      </div>

      <div className="toolbar-actions no-print">
        <div className="search-box">
          <Search size={15} />
          <input placeholder="Search employee or position" />
        </div>
        <button className="ghost-btn" onClick={onExportCsv} type="button"><Download size={15} /> CSV</button>
        <button className="ghost-btn" onClick={onExportJson} type="button"><FileJson size={15} /> JSON</button>
        <button className="ghost-btn" onClick={onPrint} type="button"><Printer size={15} /> Print / PDF</button>
        <button className="ghost-btn"><ShieldCheck size={15} /> Audit</button>
        <button className="ghost-btn"><Lock size={15} /> Lock</button>
        <button className="ghost-btn auto-fill-btn" onClick={onAutoFill} type="button"><Wand2 size={15} /> Auto-fill</button>
        <button className="primary-btn"><Sparkles size={15} /> Publish</button>
      </div>
    </div>
  )
}
