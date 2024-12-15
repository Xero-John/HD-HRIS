import React, { useEffect, useState } from "react";
import { Card, CardHeader, User, Button, ScrollShadow, cn, Chip } from "@nextui-org/react";
import { useForm, FormProvider } from "react-hook-form";
import { Employee } from "@/types/employeee/EmployeeType";
import EmployeeInformation from "./EmployeeInformation";
import EmployeeStatusActions from "./EmployeeStatusActions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Typography, { Section } from "@/components/common/typography/Typography";
import UserMail from "@/components/common/avatar/user-info-mail";
import CardTable from "@/components/common/card-view/card-table";
import BorderCard from "@/components/common/BorderCard";
import CardView from "@/components/common/card-view/card-view";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import dayjs from "dayjs";

interface ViewEmployeeProps {
  employee: Employee;
  onEmployeeUpdated: () => Promise<void>;
  onClose: () => void;
  sortedEmployees: Employee[];
}

const employeeInfoSchema = z.object({
  gender: z.string(),
  age: z.string(),
  birthdate: z.string(),
  address: z.string(),
  workingType: z.string(),
});

const statusActionSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().optional(),
});

type EmployeeInfoFormData = z.infer<typeof employeeInfoSchema>;
type StatusActionFormData = z.infer<typeof statusActionSchema>;

const calculateAge = (birthdate: string): number => {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const ViewEmployee: React.FC<ViewEmployeeProps> = ({
  employee: initialEmployee,
  onEmployeeUpdated,
  onClose,
  sortedEmployees
}) => {
  const [employee, setEmployee] = useState<Employee>(initialEmployee);

  const infoMethods = useForm<EmployeeInfoFormData>({
    resolver: zodResolver(employeeInfoSchema),
    defaultValues: {
      gender: "",
      age: "",
      birthdate: "",
      address: "",
      workingType: "",
    },
    mode: "onChange",
  });

  const statusMethods = useForm<StatusActionFormData>({
    resolver: zodResolver(statusActionSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (employee?.id) {
      const updatedEmployee = sortedEmployees.find(e => e.id === employee.id);
      if (updatedEmployee) {
        setEmployee(updatedEmployee);
      }
    }
  }, [sortedEmployees, employee?.id]);

  useEffect(() => {
    if (initialEmployee) {
      setEmployee(initialEmployee);
      const address = {
        baranggay: initialEmployee?.ref_addresses_trans_employees_addr_baranggayToref_addresses?.address_name,
        municipal: initialEmployee?.ref_addresses_trans_employees_addr_municipalToref_addresses?.address_name,
        province: initialEmployee?.ref_addresses_trans_employees_addr_provinceToref_addresses?.address_name,
        region: initialEmployee?.ref_addresses_trans_employees_addr_regionToref_addresses?.address_name,
      };

      infoMethods.reset({
        gender: initialEmployee.gender === "M" ? "Male" : "Female",
        age: `${calculateAge(initialEmployee.birthdate)} years old`,
        birthdate: new Date(initialEmployee.birthdate).toISOString().split('T')[0],
        address: `${address.baranggay}, ${address.municipal}, ${address.province}, ${address.region}`,
        workingType: initialEmployee.ref_departments?.name || "N/A",
      });
    }
  }, [initialEmployee, infoMethods]);

  const handleEmployeeUpdated = async () => {
    await onEmployeeUpdated();
  };

  const isActive = !employee.suspension_json &&
    !employee.resignation_json &&
    !employee.termination_json;

  const getStatusColor = (isActive: boolean) => {
    if (isActive) return "success";
    if (employee.suspension_json) return "warning";
    return "danger"; // for resigned or terminated
  };

  return (
    <CardView
      onClose={onClose}
      header={
        <div className="flex flex-row items-center justify-between space-x-4 pb-2">
          <UserMail
            name={
              <Typography className="font-semibold">
                {employee?.first_name} {employee?.last_name}
              </Typography>
            }
            picture={employee?.picture || ""}
            email={employee?.email || "No Email"}
          />
          <Chip
            size="md"
            color={getStatusColor(isActive)}
            variant="flat"
          >
            {isActive ? "Active" : employee.suspension_json ? "Suspended" : employee.resignation_json ? "Resigned" : employee.termination_json ? "Terminated" : employee.status}
          </Chip>
        </div>
      }
      body={
        <>
          <CardTable 
            data={[
              {
                label: "Department",
                value: employee?.ref_departments?.name || "N/A"
              },
              {
                label: "Position",
                value: employee?.ref_job_classes?.name || "N/A"
              },
              {
                label: "Employment Status",
                value: employee?.ref_employment_status?.name || "N/A"
              },
              {
                label: "Hire Date",
                value: employee?.hired_at ? dayjs(employee?.hired_at).format("YYYY-MM-DD") : "N/A"
              },
              {
                label: "Contact Number",
                value: employee?.contact_no ? `+63${employee.contact_no}` : "N/A"
              },
              {
                label: "Gender",
                value: employee?.gender === "M" ? "Male" : "Female"
              },
              {
                label: "Birthdate",
                value: dayjs(employee?.birthdate).format("YYYY-MM-DD")
              },
              {
                label: "Age",
                value: `${calculateAge(employee?.birthdate)} years old`
              },
              {
                label: "Address",
                value: `${employee?.ref_addresses_trans_employees_addr_baranggayToref_addresses?.address_name || ""}, 
                       ${employee?.ref_addresses_trans_employees_addr_municipalToref_addresses?.address_name || ""}, 
                       ${employee?.ref_addresses_trans_employees_addr_provinceToref_addresses?.address_name || ""}, 
                       ${employee?.ref_addresses_trans_employees_addr_regionToref_addresses?.address_name || ""}`
              }
            ]} 
          />

          <hr className="border border-default-400 space-y-2"/>
        </>
      }
      onDanger={
        <FormProvider {...statusMethods}>
          <EmployeeStatusActions
            employee={employee}
            onEmployeeUpdated={handleEmployeeUpdated}
            onClose={onClose}
            methods={statusMethods}
            sortedEmployees={sortedEmployees}
          />
        </FormProvider>
      }
    />
  );
};

export default ViewEmployee;
