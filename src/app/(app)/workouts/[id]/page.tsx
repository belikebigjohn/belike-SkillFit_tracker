"use client";

import { useParams } from "next/navigation";

import WorkoutEditor from "@/components/app/workout-editor";

export default function WorkoutPage() {
  const { id } = useParams<{ id: string }>();
  return <WorkoutEditor id={id} />;
}
