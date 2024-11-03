"use client";
import {
  searchConfig,
  sortProps,
  tableConfig,
} from "@/components/admin/incident/reports/configs";
import IncidentDrawer from "@/components/admin/incident/reports/incident-drawer";
import DataDisplay from "@/components/common/data-display/data-display";
import { useQuery } from "@/services/queries";
import { IncidentReport } from "@/types/incident-reports/type";
import React, { useState } from "react";

function Page() {
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IncidentReport | null>(null);
  const { data, isLoading } = useQuery<IncidentReport[]>(
    "/api/admin/incident/reports",
    { refreshInterval: 5000 }
  );
  // SetNavEndContent(() => {
  //   return (
  //     <>
  //       <Button {...uniformStyle()} onClick={() => setOpen(true)}>
  //         File incident
  //       </Button>
  //     </>
  //   );
  // });

  return (
    <>
      <DataDisplay
        title="Incident Reports"
        data={data || []}
        isLoading={isLoading}
        searchProps={searchConfig}
        sortProps={sortProps}
        onTableDisplay={{
          config: tableConfig,
          classNames: { td: "[&:nth-child(n):not(:nth-child(1))]:w-[165px]" },
          layout: "auto",
          onRowAction: (key) => {
            const item = data?.find((item) => item.id === Number(key));
            setSelectedItem(item!);
            // console.log(item);
            setOpen(true);
          },
        }}
        defaultDisplay="table"
        paginationProps={{
          data_length: data?.length,
        }}
      />

      <IncidentDrawer
        selected={selectedItem}
        isOpen={open}
        onClose={(b)=>{setOpen(b); setTimeout(()=>{
          setSelectedItem(null);
        },500)}}
        // isSubmitting={false}
      />
    </>
  );
}
export default Page;