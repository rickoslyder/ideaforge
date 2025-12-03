"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SnapshotTimeline } from "@/components/snapshots";
import { useSnapshots } from "@/hooks/use-snapshots";

interface SnapshotsPageProps {
  params: { projectId: string };
}

export default function SnapshotsPage({ params }: SnapshotsPageProps) {
  const router = useRouter();
  const {
    snapshots,
    isLoading,
    createSnapshot,
    deleteSnapshot,
    restoreSnapshot,
    refresh,
  } = useSnapshots(params.projectId);

  const handleRestore = async (snapshotId: string) => {
    await restoreSnapshot(snapshotId);
    // Redirect to project after restore
    router.push(`/projects/${params.projectId}/request`);
    router.refresh();
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Project
        </Button>
        <h1 className="text-2xl font-bold">Version History</h1>
        <p className="text-muted-foreground mt-1">
          View and restore previous versions of your project
        </p>
      </div>

      <SnapshotTimeline
        snapshots={snapshots}
        isLoading={isLoading}
        onCreateSnapshot={createSnapshot}
        onDeleteSnapshot={deleteSnapshot}
        onRestoreSnapshot={handleRestore}
        onRefresh={refresh}
      />
    </div>
  );
}
