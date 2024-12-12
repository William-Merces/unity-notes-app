// src/components/ui/nav-button/nav-button.tsx

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/utils';

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    direction: 'prev' | 'next';
    showLabel?: boolean;
}

const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
    ({ direction, showLabel = false, className, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                variant="ghost"
                size="lg"
                className={cn(
                    "relative group px-3 py-6 hover:bg-primary/10 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    className
                )}
                {...props}
            >
                <motion.div
                    whileHover={{ x: direction === 'prev' ? -5 : 5 }}
                    className="flex items-center gap-2"
                >
                    {direction === 'prev' ? (
                        <>
                            <ChevronLeft className="h-8 w-8 text-primary" />
                            {showLabel && (
                                <span className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Anterior
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            {showLabel && (
                                <span className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Próximo
                                </span>
                            )}
                            <ChevronRight className="h-8 w-8 text-primary" />
                        </>
                    )}
                </motion.div>
            </Button>
        );
    }
);

NavButton.displayName = 'NavButton';

export { NavButton };