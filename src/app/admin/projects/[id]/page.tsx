"use client";
import { useParams } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectsForm";

export default function EditProjectPage() {
  const params = useParams();
  const projectId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : null;

  return <ProjectForm projectId={projectId} />;
}
