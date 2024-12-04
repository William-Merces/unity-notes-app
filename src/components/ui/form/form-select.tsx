// src/components/ui/form/form-select.tsx
'use client';

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select/select";

interface Option {
    value: string;
    label: string;
}

interface FormSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
}

export function FormSelect({
    value,
    onChange,
    options,
    placeholder = "Selecione uma opção",
    disabled = false,
    required = false,
}: FormSelectProps) {
    return (
        <Select
            defaultValue={value || undefined}
            value={value || undefined}
            onValueChange={onChange}
            required={required}
        >
            <SelectTrigger disabled={disabled}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}