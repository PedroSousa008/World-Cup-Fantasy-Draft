import { TableView } from "@/components/tournament/table-view";
import { getGroupTablesData } from "@/lib/tournament/get-tournament-data";

export const dynamic = "force-dynamic";

export default async function CalendarTableGroupStagePage() {
  const { tables, bestThird } = await getGroupTablesData();
  return <TableView tables={tables} bestThird={bestThird} />;
}
