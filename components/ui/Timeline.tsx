import { FileText, Pill, Stethoscope } from "lucide-react";

export function Timeline() {
  return (
    <div className="timeline">
      <div>
        <span className="timeline-icon">
          <Pill size={15} />
        </span>
        <div>
          <strong>Prescription generated</strong>
          <p>Natrum Muriaticum 200C · 4 pills daily</p>
          <small>12 Jun 2026 · Dr. Maya Smith</small>
        </div>
      </div>
      <div>
        <span className="timeline-icon timeline-icon-green">
          <Stethoscope size={15} />
        </span>
        <div>
          <strong>Treatment record added</strong>
          <p>Improvement noted in migraine frequency.</p>
          <small>12 Jun 2026 · Dr. Maya Smith</small>
        </div>
      </div>
      <div>
        <span className="timeline-icon timeline-icon-amber">
          <FileText size={15} />
        </span>
        <div>
          <strong>Medical report uploaded</strong>
          <p>CBC Blood Test - June 2026.pdf</p>
          <small>11 Jun 2026 · Reception desk</small>
        </div>
      </div>
    </div>
  );
}
