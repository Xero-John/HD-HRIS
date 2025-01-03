import { ModuleNames, PrivilegeNames, static_privilege } from "@/types/privilege/privilege";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

export const staticModulePaths = static_privilege?.modules.flatMap((module) =>
    module.privileges.flatMap((privilege) => privilege.paths)
);

export function useModulePath() {
    const { data } = useSession();

    const allPaths = useMemo(() => data?.user?.modulePaths || [], [data]);

    const isPathAuthorized = useMemo(() => {
        return (pathname: string) => {
            const shouldValidatePath = staticModulePaths.some((staticPath) => pathname.startsWith(staticPath));
            return allPaths.some((allowedPath) => (shouldValidatePath ? pathname.startsWith(allowedPath) : true));
        };
    }, [staticModulePaths, allPaths]);

    const isModuleAuthorized = useMemo(() => {
        return (name: ModuleNames) => {
            const paths = static_privilege.modules
                .find((module) => module.name === name)
                ?.privileges.flatMap((privilege) => privilege.paths);
            return paths?.some((path) => allPaths.includes(path));
        };
    }, [static_privilege, allPaths]);

    const isPrivilegeAuthorized = useMemo(() => {
        return (name: PrivilegeNames) => {
            const paths = static_privilege.modules
                .find((module) => module.privileges.some((privilege) => privilege.name === name))
                ?.privileges.find((privilege) => privilege.name === name)?.paths;

            return paths?.some((path) => allPaths.includes(path));
        };
    }, [static_privilege, allPaths]);

    const getPathsByName = useMemo(() => {
        return (name: ModuleNames) => {
            return static_privilege.modules
                .find((module) => module.name === name)
                ?.privileges.flatMap((privilege) => privilege.paths);
        };
    }, [static_privilege]);

    return {
        allPaths,
        isPathAuthorized,
        isModuleAuthorized,
        isPrivilegeAuthorized,
        getPathsByName,
    };
}
