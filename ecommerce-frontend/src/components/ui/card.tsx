'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'handcrafted';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  hover?: boolean;
  gradient?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({variant='default',padding='md',children,hover=false,gradient=false,className,...props}, ref) => {
    const baseStyles = 'relative overflow-hidden transition-all duration-300';
    const variants = {default:'bg-dark-bg-secondary border border-dark-border-primary',elevated:'bg-dark-bg-secondary shadow-lg hover:shadow-xl border border-dark-border-primary',outlined:'bg-transparent border-2 border-dark-border-primary hover:border-accent-500',handcrafted:'bg-gradient-to-br from-heritage-50 to-heritage-100 border border-heritage-200 shadow-lg'};
    const paddings = {none:'',sm:'p-3',md:'p-4',lg:'p-6',xl:'p-8'};
    const hoverStyles = hover ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' : '';
    const gradientStyles = gradient ? 'bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-heritage-500/10' : '';
    return (<div ref={ref} className={cn(baseStyles,variants[variant],paddings[padding],hoverStyles,gradientStyles,className)} {...props}>{variant === 'handcrafted' && <div className="absolute inset-0 bg-handloom-pattern opacity-30 pointer-events-none" />}<div className="relative z-10">{children}</div></div>);
});
Card.displayName='Card';

export const CardHeader=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=>(<div ref={ref} className={cn('flex flex-col space-y-1.5 p-6',className)} {...props} />));
CardHeader.displayName='CardHeader';

export const CardTitle=React.forwardRef<HTMLHeadingElement,React.HTMLAttributes<HTMLHeadingElement>>(({className,...props},ref)=>(<h3 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight',className)} {...props} />));
CardTitle.displayName='CardTitle';

export const CardDescription=React.forwardRef<HTMLParagraphElement,React.HTMLAttributes<HTMLParagraphElement>>(({className,...props},ref)=>(<p ref={ref} className={cn('text-sm text-dark-text-secondary',className)} {...props} />));
CardDescription.displayName='CardDescription';

export const CardContent=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=>(<div ref={ref} className={cn('p-6 pt-0',className)} {...props} />));
CardContent.displayName='CardContent';

export const CardFooter=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=>(<div ref={ref} className={cn('flex items-center p-6 pt-0',className)} {...props} />));
CardFooter.displayName='CardFooter';

export default Card;
