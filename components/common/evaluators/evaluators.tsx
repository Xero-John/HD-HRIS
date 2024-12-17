import React, {useCallback, useMemo, useState} from 'react';
import BorderCard from "@/components/common/BorderCard";
import Typography from "@/components/common/typography/Typography";
import {capitalize} from "@nextui-org/shared-utils";
import {Chip, Textarea, User} from "@nextui-org/react";
import AcceptReject from "@/components/actions/AcceptReject";
import {Evaluations, Evaluator, User as EvaluatorUser} from '@/types/leaves/leave-evaluators-types';
import {useUserInfo} from "@/lib/utils/getEmployeInfo";
import UserMail from "@/components/common/avatar/user-info-mail";
import {ApprovalStatusType} from "@/types/attendance-time/OvertimeType";
import showDialog from "@/lib/utils/confirmDialog";
import {toGMT8} from "@/lib/utils/toGMT8";
import axios from "axios";
import {toast} from "@/components/ui/use-toast";
import {axiosInstance} from "@/services/fetcher";

interface EvaluatorsProp{
    evaluation: Evaluations
    selectedEmployee: {
        id: number,
        name: string
    },
    mutate: () => void
    onClose?: () => void
    evaluatorsApi: string
}
function Evaluators({evaluation, selectedEmployee, mutate, onClose, evaluatorsApi}: EvaluatorsProp) {
    const {id, name} = selectedEmployee
    const currentUser = useUserInfo()
    const [rejectReason, setRejectReason] = useState("");
    const currentEvaluatingOrderNumber = useMemo(() => {
        let orderNumber = 0;
        if (evaluation?.evaluators.length) {
            const sortedEvaluators = evaluation.evaluators.sort((a, b) => a.order_number - b.order_number);

            for (const item of sortedEvaluators) {
                if (item.decision.is_decided === null) {
                    orderNumber = item.order_number;
                    break;
                }
            }
        }
        return orderNumber;
    }, [evaluation]);

    const getUserById = useMemo(() => {
        return (id: number) => {
            return evaluation.users.find((user) => Number(user.id) === id || user.employee_id === id);
        };
    }, [evaluation.users]);

    const onUpdate = useCallback(
        async (status: ApprovalStatusType) => {
            const isApproved = status === "approved";

            const response = await showDialog({
                title: `${isApproved ? "Approval" : "Rejection"}`,
                message: `Do you confirm to ${isApproved ? "approve" : "reject"} ${
                   name
                }'s overtime application?`,
                preferredAnswer: isApproved ? "yes" : "no",
            });
            if (response === "yes") {
                try {
                    const updatedEvaluators = evaluation.evaluators.map((evaluator) => {
                        if (isApproved) {
                            if (evaluator.evaluated_by === currentUser?.id) {
                                return {
                                    ...evaluator,
                                    decision: {
                                        is_decided: isApproved,
                                        decisionDate: toGMT8().toDate(),
                                        rejectedReason: rejectReason === "" ? null : rejectReason,
                                    },
                                };
                            }
                        } else {
                            if (evaluator.decision.is_decided === null) {
                                return {
                                    ...evaluator,
                                    decision: {
                                        is_decided: false,
                                        decisionDate: toGMT8().toDate(),
                                        rejectedReason:
                                            evaluator.evaluated_by === currentUser?.id
                                                ? rejectReason
                                                : "Signatory is unsuccessful",
                                    },
                                };
                            }
                        }
                        return evaluator;
                    });
                    let newEvaluators = {...evaluation, evaluators: updatedEvaluators};
                    const isAllApproved = evaluation.evaluators.every((item) => item.decision.is_decided === true);
                    const isStillPending = evaluation.evaluators.some((item) => item.decision.is_decided === null);
                   await axiosInstance.post(evaluatorsApi, {
                           id: selectedEmployee.id,
                           status: isAllApproved ? "approved" : isStillPending ? "pending" : "rejected",
                           evaluators: newEvaluators,
                   })
                    mutate();
                    onClose && onClose();

                    // console.log("Selected User: ", {name, id})
                    // console.log("New Evaluator: ", newEvaluators)
                    // console.log("isAllApproved: ", isAllApproved ? "approved" : isStillPending ? "pending" : "rejected")
                    toast({
                        title: isApproved ? "Signatory Approved" : "Signatories Rejected",
                        description: "Overtime has been " + status,
                        variant: isApproved ? "success" : "default",
                    });
                } catch (error) {
                    console.log(error);
                    toast({
                        title: "An error has occured",
                        // description: String(error),
                        variant: "danger",
                    });
                }
            }
        },
        [selectedEmployee, evaluation, currentUser?.id, rejectReason]
    );
    return (
        <>{
            evaluation.evaluators.map((item, index) => {
                const isApproving =
                    item.order_number === currentEvaluatingOrderNumber && Number(item.evaluated_by) === Number(currentUser?.id);


                return(
                    <BorderCard key={index} heading={<Typography
                        className="text-medium">{capitalize(getUserById(item.evaluated_by)?.role!)} Details</Typography>}>
                        <div className="flex justify-between items-center">
                            <UserMail
                                size="sm"
                                name={getUserById(item.evaluated_by)?.name ?? "No Name"}
                                picture={getUserById(item.evaluated_by)?.picture ?? ""}
                                description={
                                    getUserById(item.evaluated_by)?.position ??
                                    getUserById(item.evaluated_by)?.department ??
                                    getUserById(item.evaluated_by)?.email ??
                                    undefined
                                }
                            />

                            {isApproving ? (
                                <AcceptReject
                                    onAccept={async () => onUpdate("approved")}
                                    onReject={async () => onUpdate("rejected")}
                                    isDisabled={{
                                        accept: rejectReason != "",
                                        reject: rejectReason === "",
                                    }}
                                />
                            ) : (
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    color={
                                        item.decision.is_decided === null
                                            ? "warning"
                                            : !item.decision.is_decided
                                                ? "danger"
                                                : "success"
                                    }
                                >
                                    {item.decision.is_decided === null
                                        ? "Pending"
                                        : !item.decision.is_decided
                                            ? "Rejected"
                                            : "Approved"}
                                </Chip>
                            )}
                        </div>
                        {isApproving && (
                            <Textarea
                                placeholder="Reason for rejection"
                                value={rejectReason}
                                onValueChange={setRejectReason}
                            />
                        )}
                    </BorderCard>
                )
            })
        }</>
    );
}

export default Evaluators;