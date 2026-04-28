import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

interface RenameBookModalProps {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onConfirm: (newName: string) => Promise<void>;
}

const RenameBookModal: React.FC<RenameBookModalProps> = ({
  open,
  currentName,
  onClose,
  onConfirm,
}) => {
  const [value, setValue] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValue(currentName);
      setError('');
    }
  }, [open, currentName]);

  const handleConfirm = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Name must not be empty.');
      return;
    }
    setSaving(true);
    try {
      await onConfirm(trimmed);
      onClose();
    } catch {
      setError('Failed to rename book. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Rename Book</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Display Name"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          error={!!error}
          helperText={error || 'This name is shown in the admin interface only.'}
          margin="dense"
          disabled={saving}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : undefined}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameBookModal;
