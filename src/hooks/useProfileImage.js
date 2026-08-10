import { useQuery } from "@tanstack/react-query";
import { getDocumentContent } from "@/lib/api/endpoints";

export function useProfileImage(profile) {
  const p = profile || {};
  const imageId =
    p.profileImageID ||
    p.custPhotoId ||
    p.CUSTPHOTOID ||
    p.PROFILEIMAGEID ||
    p.profileImageId ||
    p.custphotoid ||
    null;

  return useQuery({
    queryKey: ["profileImage", imageId],
    queryFn: async () => {
      if (!imageId) return null;
      const res = await getDocumentContent({ imgId: imageId });
      return res?.data || null;
    },
    enabled: !!imageId,
    retry: false,
    staleTime: Infinity,
  });
}
