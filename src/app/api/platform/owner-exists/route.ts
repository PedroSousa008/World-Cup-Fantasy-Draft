import { ownerExists } from "@/lib/platform";

export async function GET() {
  const exists = await ownerExists();
  return Response.json({ ownerExists: exists });
}
