'use client'

import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Chip,
  Spinner,
  cn,
} from "@nextui-org/react";
import FormFields, { FormInputProps } from "@/components/common/forms/FormFields";
import Text from "@/components/Text";
import { Employee, Status, UnavaliableStatusJSON } from "@/types/employeee/EmployeeType";
import { UseFormReturn } from "react-hook-form";
import { BiErrorCircle, BiEdit } from "react-icons/bi";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import dayjs from "dayjs";
import { z } from "zod";
import { parseAbsoluteToLocal } from "@internationalized/date";
import { DateStyle } from "@/lib/custom/styles/InputStyle";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { addUnavailability, getActiveUnavailability, isEmployeeAvailable } from "@/helper/employee/unavailableEmployee";
import { useUserInfo } from "@/lib/utils/getEmployeInfo";
import { toGMT8 } from "@/lib/utils/toGMT8";

// Define the schema
const statusFormSchema = z.object({
  startDate: z.string().min(1, "Date is required"),
  endDate: z.string().optional(),
  reason: z.string().min(10, "Please provide a more detailed reason"),
});

type StatusFormData = z.infer<typeof statusFormSchema>;

interface EmployeeStatusActionsProps {
  employee: Employee;
  onEmployeeUpdated: () => Promise<void>;
  onClose: () => void;
  methods: UseFormReturn<any>;
  sortedEmployees: Employee[];
}

type ModalType = "suspend" | "resign" | "terminate" | null;

interface StatusInfo {
  type: string;
  modalType: ModalType;
  data: UnavaliableStatusJSON[] | null;
  color: string;
}

const EmployeeStatusActions: React.FC<EmployeeStatusActionsProps> = ({
  employee,
  onEmployeeUpdated,
  onClose,
  methods,
  sortedEmployees,
}) => {
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isStatusUpdateSubmitting, setIsStatusUpdateSubmitting] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(employee);
  const userInfo = useUserInfo();

  useEffect(() => {
    const updatedEmployee = sortedEmployees.find((e) => e.id === employee.id);
    if (updatedEmployee) {
      setCurrentEmployee(updatedEmployee);
    }
  }, [employee, sortedEmployees]);

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY");
  };

  const today = dayjs().startOf('day');
  const getFormFields = (type: ModalType): FormInputProps[] => {
    const commonDateConfig = {
      classNames: DateStyle,
      validationState: "valid"
    };

    switch (type) {
      case "suspend":
        return [
          {
            name: "startDate",
            label: "Suspension Start Date",
            type: "date-picker",
            isRequired: true,
            config: {
              placeholder: "Select suspension start date",
              maxValue: parseAbsoluteToLocal(dayjs().endOf('day').toISOString()),
              defaultValue: today.toISOString(),
              ...commonDateConfig
            }
          },
          {
            name: "endDate",
            label: "Suspension End Date",
            type: "date-picker",
            isRequired: true,
            config: {
              placeholder: "Select suspension end date",
              minValue: parseAbsoluteToLocal(dayjs().startOf('day').toISOString()),
              ...commonDateConfig
            }
          },
          {
            name: "reason",
            label: "Suspension Reason",
            type: "text-area",
            isRequired: true,
            config: {
              minRows: 3,
              maxRows: 5,
              placeholder: "Enter reason for suspension"
            },
          },
        ];
      case "resign":
        return [
          {
            name: "startDate",
            label: "Resignation Date",
            type: "date-picker",
            isRequired: true,
            config: {
              placeholder: "Select resignation date",
              maxValue: parseAbsoluteToLocal(dayjs().endOf('day').toISOString()),
              defaultValue: today.toISOString(),
              ...commonDateConfig
            }
          },
          {
            name: "reason",
            label: "Resignation Reason",
            type: "text-area",
            isRequired: true,
            config: {
              minRows: 3,
              maxRows: 5,
              placeholder: "Enter reason for resignation"
            },
          },
        ];
      case "terminate":
        return [
          {
            name: "startDate",
            label: "Termination Date",
            type: "date-picker",
            isRequired: true,
            config: {
              placeholder: "Select termination date",
              maxValue: parseAbsoluteToLocal(dayjs().endOf('day').toISOString()),
              defaultValue: today.toISOString(),
              ...commonDateConfig
            }
          },
          {
            name: "reason",
            label: "Termination Reason",
            type: "text-area",
            isRequired: true,
            config: {
              minRows: 3,
              maxRows: 5,
              placeholder: "Enter reason for termination"
            },
          },
        ];
      default:
        return [];
    }
  };

  const validateDates = (data: StatusFormData, type: ModalType): string | null => {
    if (type === 'suspend' && data.endDate) {
      const startDate = dayjs(data.startDate);
      const endDate = dayjs(data.endDate);

      if (endDate.isBefore(startDate)) {
        return "End date must be after the start date";
      }
    }
    return null;
  };

  const handleModalOpen = (type: ModalType) => {
    setActiveModal(type);
    let formData = {};

    const today = toGMT8();

    switch (type) {
      case "suspend":
        const suspension_json = getActiveUnavailability({entry: currentEmployee.suspension_json});
        if (suspension_json) {
          formData = {
            startDate: toGMT8(suspension_json.start_date).toISOString(),
            endDate: toGMT8(suspension_json.end_date!).toISOString(),
            reason: suspension_json.reason,
          };
        } else {
          formData = {
            startDate: today.toISOString(),
            endDate: today.add(3,'days').toISOString(),
            reason: ""
          };
        }
        break;
      case "resign":
        const resignation_json = getActiveUnavailability({entry: currentEmployee.resignation_json});
        if (resignation_json) {
          // const data = typeof currentEmployee.resignation_json === "string"
          //   ? JSON.parse(currentEmployee.resignation_json)
          //   : currentEmployee.resignation_json;
          formData = {
            startDate: toGMT8(resignation_json.start_date).toISOString(),
            endDate: resignation_json.end_date ? toGMT8(resignation_json.end_date).toISOString() : null,
            reason: resignation_json.reason,
          };
        } else {
          formData = {
            startDate: today.toISOString(),
            endDate: null,
            reason: ""
          };
        }
        break;
      case "terminate":
        const termination_json = getActiveUnavailability({entry: currentEmployee.termination_json});
        if (termination_json) {
          // const data = typeof currentEmployee.termination_json === "string"
          //   ? JSON.parse(currentEmployee.termination_json)
          //   : currentEmployee.termination_json;
          formData = {
            startDate: toGMT8(termination_json.start_date).toISOString(),
            endDate: termination_json.end_date ? toGMT8(termination_json.end_date).toISOString() : null,
            reason: termination_json.reason,
          };
        } else {
          formData = {
            startDate: today.toISOString(),
            endDate: null,
            reason: ""
          };
        }
        break;
    }

    methods.reset(formData);
  };

  const handleStatusUpdate = async (formData: StatusFormData) => {
    setIsStatusUpdateSubmitting(true);
    try {
      const validationResult = statusFormSchema.safeParse(formData);

      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        toast({
          title: "Validation Error",
          description: errors[0].message,
          variant: "danger",
          duration: 3000,
        });
        return;
      }

      const dateError = validateDates(formData, activeModal!);
      if (dateError) {
        toast({
          title: "Date Validation Error",
          description: dateError,
          variant: "danger",
          duration: 3000,
        });
        return;
      }

      let status: Status;
      let description: string;

      switch (activeModal) {
        case "suspend":
          status = "suspended";
          description = "Employee has been suspended";
          break;
        case "resign":
          status = "resigned";
          description = "Employee has resigned";
          break;
        case "terminate":
          status = "terminated";
          description = "Employee has been terminated";
          break;
        default:
          throw new Error("Invalid modal type");
      }

      // const updateData = {
      //   status,
      //   date: formData.startDate,
      //   reason: formData.reason,
      //   ...(status === "suspended" && { endDate: formData.endDate }),
      // };
      const updateData = addUnavailability({
        start_date: formData.startDate,
        end_date: status === "suspended" ? formData.endDate! : null,
        reason: formData.reason,
        entry: status === "suspended" ? currentEmployee.suspension_json : status === "resigned" ? currentEmployee.resignation_json : currentEmployee.termination_json,
        initiated_by: userInfo!,
      })

      const response = await axios.put(
        `/api/employeemanagement/employees?id=${currentEmployee.id}&type=status`,
        { updateData, status }
      );

      if (response.status === 200) {
        toast({
          title: `Status Updated: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          description,
          variant: "success",
          duration: 3000,
        });
        methods.reset();
        await onEmployeeUpdated();
        setActiveModal(null);
        onClose();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "danger",
        duration: 5000,
      });
    } finally {
      setIsStatusUpdateSubmitting(false);
    }
  };

  const StatusDisplay = () => {
    const getStatusInfo = (): StatusInfo => {
      if (currentEmployee.suspension_json) {
        // const suspensionData = typeof currentEmployee.suspension_json === "string"
        //   ? JSON.parse(currentEmployee.suspension_json)
        //   : currentEmployee.suspension_json;
        // return {
        //   type: "Suspended",
        //   modalType: "suspend",
        //   data: {
        //     : suspensionData.startDate,
        //     endDate: suspensionData.endDate,
        //     reason: suspensionData.reason || suspensionData.suspensionReason,
        //   },
        //   color: "warning" as const,
        // };
        return {
          type: "Suspended",
          modalType: "suspend",
          data: currentEmployee.suspension_json,
          color: "warning" as const,
        };
      }
      if (currentEmployee.resignation_json) {
        // const resignationData = typeof currentEmployee.resignation_json === "string"
        //   ? JSON.parse(currentEmployee.resignation_json)
        //   : currentEmployee.resignation_json;
        // return {
        //   type: "Resigned",
        //   modalType: "resign",
        //   data: {
        //     startDate: resignationData.resignationDate,
        //     reason: resignationData.reason || resignationData.resignationReason,
        //   },
        //   color: "default" as const,
        // };
        return {
          type: "Resigned",
          modalType: "resign",
          data: currentEmployee.resignation_json,
          color: "default" as const,
        };
      }
      if (currentEmployee.termination_json) {
        // const terminationData = typeof currentEmployee.termination_json === "string"
        //   ? JSON.parse(currentEmployee.termination_json)
        //   : currentEmployee.termination_json;
        // return {
        //   type: "Terminated",
        //   modalType: "terminate",
        //   data: {
        //     startDate: terminationData.terminationDate,
        //     reason: terminationData.reason || terminationData.terminationReason,
        //   },
        //   color: "danger" as const,
        // };
        return {
            type: "Terminated",
            modalType: "terminate",
            data: currentEmployee.termination_json,
            color: "danger" as const,
          };
      }
      return {
        type: "Active",
        modalType: null,
        data: null,
        color: "success" as const,
      };
    };

    const status = getStatusInfo();
    
  return <>
    {status.data?.map(item=>(
        // I'll add a key
        <div key={item.id} className="space-y-2 font-black">
          <div className="space-y-2">
            <div>
              <Text className="text-xs text-gray-600 tracking-wider uppercase font-medium">
                {status.type === "Suspended"
                  ? "Start Date"
                  : status.type === "Resigned"
                  ? "Resignation Date"
                  : "Termination Date"}
              </Text>
              <Text className="text-sm text-gray-800 font-light">
                {item ? formatDate(item.start_date) : "-"}
              </Text>
            </div>
    
            {status.type === "Suspended" && (
              <div>
                <Text className="text-xs text-gray-600 tracking-wider uppercase font-medium">
                  End Date
                </Text>
                <Text className="text-sm text-gray-800 font-light">
                  {item?.end_date ? formatDate(item.end_date) : "-"}
                </Text>
              </div>
            )}
          </div>
    
          <div className="border rounded-xl p-4 bg-gray-50">
            <Text className="text-xs text-gray-600 tracking-wider uppercase font-medium mb-1">
              Reason
            </Text>
            <Text className="text-sm text-gray-800 font-light">
              {item?.reason || "-"}
            </Text>
    
            {item && (
              <div className="flex justify-end mt-2">
                <Button 
                  size="md"
                  color="primary"
                  startContent={<BiEdit className="text-default-100" />}
                  onPress={() => handleModalOpen(status.modalType)}
                  isDisabled={isStatusUpdateSubmitting}
                >
                  Edit Details
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
  </>
}

  const getModalContent = () => {
    switch (activeModal) {
      case "suspend":
        return {
          title: "Suspend Employee",
          fields: getFormFields("suspend"),
          warning: "This action will suspend the employee and limit their system access.",
        };
      case "resign":
        return {
          title: "Employee Resignation",
          fields: getFormFields("resign"),
          warning: "This action will mark the employee as resigned and remove their system access.",
        };
      case "terminate":
        return {
          title: "Employee Termination",
          fields: getFormFields("terminate"),
          warning: "This action will terminate the employee and remove all system access.",
        };
      default:
        return null;
    }
  };

  const modalContent = getModalContent();
  // const isActive =
  //   !employee.resignation_json &&
  //   !employee.termination_json;
  //   !employee.suspension_json &&
  const isActive = isEmployeeAvailable(employee);
  const isSuspended = !isEmployeeAvailable(employee,"suspension");
  const isResigned = !isEmployeeAvailable(employee,"resignation");
  const isTerminated = !isEmployeeAvailable(employee,"termination");

  const Section = ({ children, title, subtitle, className }: any) => {
    return (
      <div className={`p-6 border rounded-xl bg-gray-50 ${className}`}>
        <div className="flex justify-between items-center">
          <div>
            <Text className="text-lg font-semibold">{title}</Text>
            <Text className="text-sm text-gray-600">{subtitle}</Text>
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {isActive ? (
        <div className="space-y-4">
          <Section
            className="ms-0"
            title="Temporary Suspension"
            subtitle="Temporarily suspend employee access"
          >
            <Button
              startContent={<BiErrorCircle />}
              {...uniformStyle({ color: "warning" })}
              onPress={() => handleModalOpen("suspend")}
              isDisabled={isStatusUpdateSubmitting}
            >
              Suspend
            </Button>
          </Section>

          <Section
            className="ms-0"
            title="Permanent Removal"
            subtitle="Permanently remove employee access"
          >
            <div className="flex gap-3">
              <Button
                {...uniformStyle()}
                onPress={() => handleModalOpen("resign")}
                isDisabled={isStatusUpdateSubmitting}
              >
                Resign
              </Button>
              <Button
                {...uniformStyle({ color: "danger" })}
                onPress={() => handleModalOpen("terminate")}
                isDisabled={isStatusUpdateSubmitting}
              >
                Terminate
              </Button>
            </div>
          </Section>
        </div>
      ) : (
        <StatusDisplay />
      )}

      {modalContent && (
        <Modal
          isOpen={!!activeModal}
          onClose={() => {
            setActiveModal(null);
            methods.reset();
          }}
          size="sm"
        >
          <ModalContent>
            <form onSubmit={methods.handleSubmit(handleStatusUpdate)}>
              <ModalHeader>
                <Text className="text-xl font-semibold">
                  {modalContent.title}
                </Text>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <FormFields items={modalContent.fields} size="sm" />
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-600">
                      {modalContent.warning}
                    </Text>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isStatusUpdateSubmitting}
                >
                  Confirm
                </Button>
                <Button
                  color="default"
                  variant="flat"
                  onPress={() => {
                    setActiveModal(null);
                    methods.reset();
                  }}
                  isDisabled={isStatusUpdateSubmitting}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default EmployeeStatusActions;

