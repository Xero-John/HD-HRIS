
import {Key} from '@react-types/shared';

interface Items {
    key: string | number,
    label: string
}
export interface SelectionProp{
    placeholder?: string,
    items: Items[] |string[],
    className?: string
    onChange?:(...event: any[]) => void
    isDisabled?: boolean
    disableKeys?:  Iterable<Key>
    selectedKeys?: 'all' | Iterable<Key>
    onOpenChange?: (isOpen: boolean) => void
    value?:  string | number | readonly string[] | undefined
}
