import React from 'react';
import { AlertTriangle, Trash2, Ban, CheckCircle } from 'lucide-react';
import Modal from './Modal';
import { cn } from '@/lib/utils';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
}

const variantStyles: Record<ConfirmDialogVariant, { 
  icon: React.ElementType; 
  iconBg: string; 
  iconColor: string;
  buttonClass: string;
}> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    buttonClass: 'btn-destructive',
  },
  warning: {
    icon: Ban,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    buttonClass: 'bg-warning text-warning-foreground hover:bg-warning/90',
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    buttonClass: 'bg-success text-success-foreground hover:bg-success/90',
  },
  info: {
    icon: AlertTriangle,
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    buttonClass: 'btn-primary',
  },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="text-center py-4">
        {/* Icon */}
        <div className={cn('w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4', styles.iconBg)}>
          <Icon className={cn('w-8 h-8', styles.iconColor)} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

        {/* Message */}
        <p className="text-muted-foreground text-sm mb-6">{message}</p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary min-w-[100px]"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn('min-w-[100px] px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50', styles.buttonClass)}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
