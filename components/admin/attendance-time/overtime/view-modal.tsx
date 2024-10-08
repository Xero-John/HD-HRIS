import React, { useState, useEffect, useCallback, ReactElement } from "react";
import {
  Modal,
  Button,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Textarea,
  Avatar,
  Card,
  CardBody,
  Divider,
  Chip,
  Spinner,
  cn,
} from "@nextui-org/react";
import { Form } from "@/components/ui/form";
import FormFields from "@/components/common/forms/FormFields";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OvertimeEntry } from "@/types/attendance-time/OvertimeType";
import { uniformStyle } from "@/lib/custom/styles/SizeRadius";
import { toGMT8 } from "@/lib/utils/toGMT8";
import { getEmpFullName } from "@/lib/utils/nameFormatter";
import { FaRegClock } from "react-icons/fa6";
import { calculateShiftLength } from "@/lib/utils/timeFormatter";
import { TbClock, TbClockCancel, TbClockCheck } from "react-icons/tb";
import TableData from "@/components/tabledata/TableData";
import { AxiosResponse } from "axios";
import { axiosInstance } from "@/services/fetcher";
import { TableConfigProps } from "@/types/table/TableDataTypes";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { PiClockCountdownFill } from "react-icons/pi";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";

interface ScheduleModalProps {
  visible: boolean;
  pending: boolean;
  onClose: () => void;
  onSave: (data: OvertimeEntry) => void;
  onDelete?: (id: Number | undefined) => void;
  overtimeData?: OvertimeEntry;
}

const statusColorMap: Record<string, "danger" | "success" | "warning"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const OvertimeModal: React.FC<ScheduleModalProps> = ({
  visible,
  pending,
  onClose,
  onSave,
  onDelete,
  overtimeData: data,
}) => {
  // Effect to populate modal fields if editing
  //   const load = useCallback(() => {
  //     if (overtimeData) {
  //     //   form.reset({
  //     //     ...overtimeData,
  //     //     clock_in: toGMT8(overtimeData.clock_in).format('HH:mm'),
  //     //     clock_out: toGMT8(overtimeData.clock_out).format('HH:mm'),
  //     //     date: toGMT8(overtimeData.date).format('YYYY-MM-DD'),
  //     //   });
  //     } else {
  //     //   form.reset({
  //     //     id: -1,
  //     //     clock_in: "",
  //     //     clock_out: "",
  //     //     date: "",
  //     //     comment: "",
  //     //   });
  //     }
  //   }, [overtimeData, form]);
  //   useEffect(() => {
  //     load();
  //   }, [overtimeData]);

  const [overtimeData, setOvertimeData] = useState<OvertimeEntry>();
  const [selectedKey, setSelectedKey] = useState(new Set([""]));
  const [isLoading, setIsLoading] = useState(false);
  const [recordData, setRecordData] = useState<OvertimeEntry[]>([]);
  const [comment, setComment] = useState("");
  const fetchEmployeeOvertimeRecords = useCallback(
    async () => {
      console.log("FLAG");
      setOvertimeData(data);
      setComment(data?.comment || "")
      setIsLoading(true);
      try {
        const response: AxiosResponse<OvertimeEntry[]> =
          await axiosInstance.get(
            `/api/admin/attendance-time/overtime/preview?id=${data?.employee_id}`
          );
        setRecordData(response.data);
        setSelectedKey(new Set([String(data?.id)]));
    } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [data] // Depend on 'date' as it's used in the function
  );

  useEffect(() => {
    fetchEmployeeOvertimeRecords();
  }, [fetchEmployeeOvertimeRecords]);

  const handleSave = (value: any) => {
    const newOvertime: OvertimeEntry = {
      created_at: overtimeData
        ? overtimeData.created_at
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...value,
    };

    onSave(newOvertime);
  };

  const config: TableConfigProps<OvertimeEntry> = {
    columns: [
      { uid: "status", name: "Status", sortable: true },
      { uid: "overtime_date", name: "Overtime Date", sortable: true },
      { uid: "overtime", name: "Overtime", sortable: true },
      { uid: "duration", name: "Duration", sortable: true },
    ],
    rowCell: (item, columnKey) => {
      switch (columnKey) {
        case "overtime_date":
          return <p>{toGMT8(item.date).format("DD MMMM YYYY")}</p>;
        case "overtime":
          return (
            <p>
              <strong>{toGMT8(item.clock_in).format("hh:mm a")}</strong> -{" "}
              <strong>{toGMT8(item.clock_out).format("hh:mm a")}</strong>
            </p>
          );
        case "duration":
          return <p>{item?.rendered_mins}</p>;
        case "status":
          return (
            <Chip
              startContent={
                item.status === "approved" ? (
                  <FaCheckCircle size={18} />
                ) : item.status === "pending" ? (
                  <PiClockCountdownFill size={18} />
                ) : (
                  <IoMdCloseCircle size={18} />
                )
              }
              variant="flat"
              color={statusColorMap[item.status]}
              className="capitalize mx-auto"
            >
              {item.status}
            </Chip>
          );
        default:
          return <></>;
      }
    },
  };

  return (
    <Modal isOpen={visible} onClose={onClose} size="4xl">
      <ModalContent>
        <ModalHeader>
          {overtimeData ? "Review Overtime" : "File Overtime"}
        </ModalHeader>
        <ModalBody className="flex flex-row gap-4">
          <div className="flex flex-col gap-4 w-[440px]">
            <div className="flex gap-5">
              <Avatar
                isBordered
                radius="full"
                size="md"
                src={overtimeData?.trans_employees_overtimes?.picture ?? ""}
              />
              <div className="text-small flex flex-col gap-1 items-start justify-center">
                <h4 className="font-semibold leading-none text-default-600">
                  {getEmpFullName(overtimeData?.trans_employees_overtimes!)}
                </h4>
                <h5 className="text-small tracking-tight text-default-400">
                  {overtimeData?.trans_employees_overtimes?.email ?? ""}
                </h5>
              </div>
            </div>
            <div className="flex w-full">
              <div className="flex-1">
                {/* {left} */}
                <p className="text-small font-semibold text-default-600">
                  Requested:
                </p>
                <div>
                  <Info
                    icon={<TbClock size={20} className="text-default-600" />}
                    content={calculateShiftLength(
                      new Date().toISOString(),
                      new Date().toISOString(),
                      -Number(overtimeData?.requested_mins)
                    )
                      .replace(" h", "h")
                      .replace("ou", "")
                      .replace(" and ", " ")
                      .replace(" m", "m")
                      .replace("ute", "")}
                  />
                  <Info
                    icon={
                      <TbClockCheck size={20} className="text-default-600" />
                    }
                    content={
                      overtimeData?.clock_in
                        ? toGMT8(overtimeData.clock_in).format("hh:mm a")
                        : "N/A"
                    }
                    label="Clock In"
                  />
                  <Info
                    icon={
                      <TbClockCancel size={20} className="text-default-600" />
                    }
                    content={
                      overtimeData?.clock_out
                        ? toGMT8(overtimeData.clock_out).format("hh:mm a")
                        : "N/A"
                    }
                    label="Clock Out"
                  />
                </div>
              </div>
              <div className="flex-1">
                {/* {left} */}
                <p className="text-small font-semibold text-default-600">
                  Rendered:
                </p>
                <div>
                  <Info
                    icon={<TbClock size={20} className="text-default-600" />}
                    content={
                      overtimeData?.clock_in && overtimeData.clock_out
                        ? calculateShiftLength(
                            overtimeData.clock_in,
                            overtimeData.clock_out,
                            0
                          )
                            .replace(" h", "h")
                            .replace("ou", "")
                            .replace(" and ", " ")
                            .replace(" m", "m")
                            .replace("ute", "")
                        : "N/A"
                    }
                  />
                  <Info
                    icon={
                      <TbClockCheck size={20} className="text-default-600" />
                    }
                    content={
                      overtimeData?.clock_in
                        ? toGMT8(overtimeData.clock_in).format("hh:mm a")
                        : "N/A"
                    }
                    label="Clock In"
                  />
                  <Info
                    icon={
                      <TbClockCancel size={20} className="text-default-600" />
                    }
                    content={
                      overtimeData?.clock_out
                        ? toGMT8(overtimeData.clock_out).format("hh:mm a")
                        : "N/A"
                    }
                    label="Clock Out"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-small font-semibold text-default-600">
                Reason:
              </p>
              <Card className="min-h-20 max-h-28 max bg-gray-100" shadow="none">
                <CardBody>
                  <p className="text-small">{overtimeData?.reason}</p>
                </CardBody>
              </Card>
            </div>
            <div>
              <p className="text-small font-semibold text-default-600">
                Comment:
              </p>
              <Textarea
                value={
                  comment ||
                  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum voluptate tempore harum laboriosam quasi minima architecto dolorem blanditiis nobis soluta neque sequi, dolores ea, asperiores exercitationem perferendis laborum maxime earum!"
                }
                onValueChange={setComment}
                isReadOnly={overtimeData?.status != "pending"}
                classNames={{
                  inputWrapper: cn(
                    "border-2",
                    overtimeData?.status === "pending"
                      ? "border-gray-400"
                      : "border-gray-100"
                  ),
                }}
              />
            </div>
          </div>
          {isLoading ? (
            <Spinner label="Loading..." color="primary" className="w-full" />
          ) : (
            <TableData
              items={recordData}
              config={config}
              isHeaderSticky
              className="h-full"
              shadow="none"
              counterName="History"
              selectionMode="single"
              aria-label="History"
              disallowEmptySelection
              selectedKeys={selectedKey}
              onSelectionChange={(keys) => {
                const record = recordData.find(
                    (item) => String(item.id) === Array.from(keys)[0]
                  )
                setSelectedKey(new Set(Array.from(keys).map(String)));
                setOvertimeData(record);
                setComment(record?.comment || "");
              }}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            className="me-auto"
            variant="light"
            onClick={onClose}
            {...uniformStyle()}
          >
            Close
          </Button>
          {overtimeData?.status === "pending" && (
            <>
              <Button
                variant="flat"
                onClick={onClose}
                {...uniformStyle({ color: "danger" })}
                startContent={
                  <IoCloseSharp className="size-5 text-danger-500" />
                }
              >
                Reject
              </Button>
              <Button
                isLoading={pending}
                type="submit"
                form="schedule-form"
                {...uniformStyle({ color: "success" })}
                className="text-white"
                startContent={
                  <IoCheckmarkSharp className="size-5 text-white" />
                }
              >
                Approve
              </Button>{" "}
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Info = ({
  icon,
  content,
  label,
}: {
  icon: ReactElement;
  content: string;
  label?: string;
}) => {
  return (
    <div className="flex-1 flex items-center gap-4 min-h-10">
      {icon}
      <div>
        <p className="font-semibold leading-none">{content}</p>
        <p className="text-tiny leading-none">
          <span className="font-semibold text-gray-500 leading-none">
            {label}
          </span>
        </p>
      </div>
    </div>
  );
};

export default OvertimeModal;