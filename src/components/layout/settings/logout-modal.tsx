import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { AppText } from '@/components/ui/text';
import { signOut } from '@/utils/sign-out';
import { useDataContext } from '@/store/useDataContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import { createLogoutModalStyles } from '@/theme/createChatOverlayStyles';
import { ShowNotify } from '@/components/ui/toast';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
}

const LogoutConfirmationModal = ({ visible, onClose }: LogoutModalProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createLogoutModalStyles(colors), [colors]);
  const { dispatch } = useDataContext();
  const _navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const logoutInFlight = useRef(false);

  const closeIfIdle = () => {
    if (!logoutInFlight.current) onClose();
  };

  const logout = async () => {
    if (logoutInFlight.current) return;
    logoutInFlight.current = true;
    setLoading(true);

    try {
      const signedOut = await signOut(dispatch, onClose);
      if (!signedOut) {
        ShowNotify('Error', 'Unable to log out. Please try again.');
      }
    } catch {
      ShowNotify('Error', 'Unable to log out. Please try again.');
    } finally {
      logoutInFlight.current = false;
      setLoading(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={closeIfIdle}
    >
      <TouchableWithoutFeedback onPress={closeIfIdle}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <AppText variant="bold" style={styles.title}>
                Log Out
              </AppText>
              <AppText style={styles.message}>
                Are you sure you want to log out? You will need to sign in again
                to access your account.
              </AppText>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeIfIdle}
                  disabled={loading}
                >
                  <AppText style={styles.cancelText}>Cancel</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={logout}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <AppText variant="bold" style={styles.logoutText}>
                      Log Out
                    </AppText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LogoutConfirmationModal;
