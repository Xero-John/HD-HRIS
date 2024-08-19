import React from 'react';
import {Plus} from "lucide-react";
import Link from "next/link";
import {btnClass, cn} from "@/lib/utils";
import {Button} from "@nextui-org/button";
import {ButtonProps} from "@nextui-org/react";

interface AddProps extends ButtonProps{
    name: string,
    href: string,
    className?: string,
    variant?: ButtonProps["variant"]
}

function Add({name, href, variant, className}: AddProps) {
    return (<Button radius='none' size='sm' color='primary' variant={variant || "flat"} as={Link}
                    href={href} className={cn("", btnClass, className)}
                    startContent={<Plus/>}>{name}</Button>);
}

export default Add;