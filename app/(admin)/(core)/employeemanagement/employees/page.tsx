"use client";
import React, { useEffect, useState } from "react";
import { useEmployeesData } from "@/services/queries";
import TableData from "@/components/tabledata/TableData";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { Employee } from "@/types/employeee/EmployeeType";
import { Avatar, Button, Selection, Chip } from "@nextui-org/react";
import { TableActionButton } from "@/components/actions/ActionButton";
import { toast } from "@/components/ui/use-toast";
import AddEmployee from "@/components/admin/add/AddEmployees";
import EditEmployee from "@/components/admin/edit/EditEmployee";
import ViewEmployee from "@/components/admin/add/ViewEmployee";
import axios from "axios";
import showDialog from "@/lib/utils/confirmDialog";
import { FilterProps } from "@/types/table/default_config";

const Page: React.FC = () => {
  const { data: employees, mutate, error } = useEmployeesData();
  const [loading, setLoading] = useState(true);
  const [sortedEmployees, setSortedEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<any | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  useEffect(() => {
    if (employees) {
      const sorted = sortEmployeesByRecentActivity(employees);
      setSortedEmployees(sorted);
      setLoading(false);
    }
  }, [employees]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees. Please try again.",
        duration: 3000,
      });
      setLoading(false);
    }
  }, [error]);

  const handleEdit = (employee: Employee) => {
    setSelectedEmployeeId(employee);
    setIsEditModalOpen(true);
  };

  const handleRowAction = (key: React.Key) => {
    const employee = sortedEmployees.find((emp) => emp.id === Number(key));
    if (employee) {
      setSelectedEmployee(employee);
      setIsViewModalOpen(true);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      const result = await showDialog({
        title: "Confirm Delete",
        message: `Are you sure you want to delete '${name}' ?`,
      });
      if (result === "yes") {
        await axios.delete(`/api/employeemanagement/employees?id=${id}`);
        toast({
          title: "Deleted",
          description: "Employee deleted successfully!",
          variant: "warning",
        });
        await mutate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error: " + error,
        variant: "danger",
      });
    }
  };

  const sortEmployeesByRecentActivity = (employees: Employee[]) => {
    return [...employees].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });
  };

  const handleEmployeeUpdated = async () => {
    try {
      await mutate();
      const sorted = sortEmployeesByRecentActivity(employees || []);
      setSortedEmployees(sorted);
      console.log("Employee data updated and sorted");
    } catch (error) {
      console.error("Error updating employee data:", error);
    }
  };

  const getEmployeeStatus = (employee: Employee): string => {
    if (employee.termination_json) return "Terminated";
    if (employee.resignation_json) return "Resigned";
    if (employee.suspension_json) return "Suspended";
    return "Active";
  };

  const config: TableConfigProps<Employee> = {
    columns: [
      { uid: "name", name: "Name", sortable: true },
      { uid: "department", name: "Department", sortable: false },
      { uid: "position", name: "Position", sortable: false },
      { uid: "contact", name: "Contact", sortable: false },
      { uid: "hiredate", name: "Hired Date", sortable: false },
      { uid: "status", name: "Status", sortable: false },
      { uid: "actions", name: "Actions", sortable: false },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "name":
          return (
            <div className="flex items-center">
              <Avatar
                src={item.picture || ""}
                alt={`${item.first_name} ${item.last_name}`}
                className="w-10 h-10 rounded-full mr-10"
              />
              <span>
                {item.first_name} {item.last_name}
                {item.suffix ? `, ${item.suffix}` : ""}
                {item.extension ? ` ${item.extension}` : ""}
              </span>
            </div>
          );
        case "position":
          return <div>{item.ref_job_classes?.name || "N/A"}</div>;
        case "department":
          return <div>{item.ref_departments?.name || "N/A"}</div>;
        case "contact":
          return (
            <div className="flex flex-col items-start">
              <div>{item.email || "N/A"}</div>
              <div>{item.contact_no || "N/A"}</div>
            </div>
          );
        case "hiredate":
          return (
            <div>
              {item.hired_at
                ? new Date(item.hired_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "N/A"}
            </div>
          );
        case "status":
          const status = getEmployeeStatus(item);
          let statusColorClass: "success" | "danger" | "warning" | "default" =
            "default";
          switch (status) {
            case "Terminated":
              statusColorClass = "danger";
              break;
            case "Resigned":
              statusColorClass = "default";
              break;
            case "Suspended":
              statusColorClass = "warning";
              break;
            case "Active":
            default:
              statusColorClass = "success";
          }
          return (
            <Chip
              className="capitalize"
              color={statusColorClass}
              size="sm"
              variant="flat"
            >
              {status}
            </Chip>
          );
        case "actions":
          return (
            <div className="flex space-x-2">
              <TableActionButton
                name={`${item.first_name} ${item.last_name}`}
                onEdit={() => handleEdit(item)}
                onDelete={() =>
                  handleDelete(item.id, `${item.first_name} ${item.last_name}`)
                }
              />
            </div>
          );
        default:
          return <></>;
      }
    },
  };

  const searchingItemKey: (keyof Employee)[] = [
    "first_name",
    "last_name",
    "email",
    "contact_no",
  ];

  const filterItems: FilterProps[] = [
    {
      filtered: employees
        ? Array.from(new Set(employees.map((e) => e.ref_departments?.name)))
            .filter(Boolean)
            .map((dept) => ({
              key: dept as string,
              value: dept as string,
              name: dept as string,
              uid: dept as string,
            }))
        : [],
      category: "Department",
    },
  ];

  const filterConfig = (keys: Selection) => {
    let filteredItems: Employee[] = [...(employees || [])];

    if (keys !== "all" && keys.size > 0) {
      filteredItems = filteredItems.filter((employee) =>
        keys.has(employee.ref_departments?.name || "")
      );
    }

    return filteredItems;
  };

  return (
    <div id="employee-page" className="mt-2">
      <TableData
        aria-label="Employee Table"
        config={config}
        items={sortedEmployees}
        searchingItemKey={searchingItemKey}
        filterItems={filterItems}
        filterConfig={filterConfig}
        onRowAction={(key) => {
          const employee = sortedEmployees.find(
            (emp) => emp.id === Number(key)
          );
          if (employee) {
            setSelectedEmployee(employee);
            setIsViewModalOpen(true);
          }
        }}
        counterName="Employees"
        isLoading={loading}
        isHeaderSticky={true}
        classNames={{
          wrapper: "h-[27rem] overflow-y-auto",
        }}
        contentTop={
          <div className="flex items-center justify-between">
            <div className="ml-4">
              <AddEmployee onEmployeeAdded={handleEmployeeUpdated} />
            </div>
            <div className="ml-auto mr-4"></div>
          </div>
        }
      />

      {selectedEmployee && (
        <ViewEmployee
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          employee={selectedEmployee}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}

      {selectedEmployeeId !== null && (
        <EditEmployee
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          employeeData={selectedEmployeeId}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}
    </div>
  );
};

export default Page;
