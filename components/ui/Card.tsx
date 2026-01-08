import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export function Card({ className, children, noPadding = false, ...props }: CardProps) {
    return (
        <div
            className={clsx(
                'card', // global class
                { 'no-padding': noPadding },
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
