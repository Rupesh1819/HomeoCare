import { History } from "lucide-react";
import { getTreatments } from "@/app/actions/treatments";
import { getPatients } from "@/app/actions/patients";
import { PageHeader } from "@/components/ui/PageHeader";
import { TreatmentForm } from "@/components/treatments/TreatmentForm";
import { getAdminProfile } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function TreatmentsPage() {
  const profile = await getAdminProfile();
  if (profile.role === "LAB_TECHNICIAN" || profile.role === "PHARMACIST") {
    redirect("/");
  }

  const [history, patients] = await Promise.all([getTreatments(), getPatients()]);

  const patientOptions = patients.map((p) => ({ name: p.name, id: p.id }));

  return (
    <div className="page-stack">
      <PageHeader
        title="New consultation"
        description="Capture observations, diagnosis, medicine, and continuity-of-care instructions."
        action={
          <button className="button button-secondary">
            <History size={17} /> Treatment history
          </button>
        }
      />
      <TreatmentForm history={history} patients={patientOptions} />
    </div>
  );
}
