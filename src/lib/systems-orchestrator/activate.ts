export const getActivationScript = () => `
#!/bin/bash
set -e

SSH_USER="\${process.env.SSH_USER ?? 'computer-lab-manager'}"
SSH_USER_HOME="/home/$SSH_USER"

if ! id -u "$SSH_USER" >/dev/null 2>&1; then
    sudo useradd -m "$SSH_USER"
fi

# Setup SSH directory and authorized_keys for the SSH_USER
sudo -u "$SSH_USER" mkdir -p "$SSH_USER_HOME/.ssh"
sudo -u "$SSH_USER" chmod 700 "$SSH_USER_HOME/.ssh"
sudo -u "$SSH_USER" sh -c "echo "\\"$SSH_PUBLIC_KEY\\"" >> "$SSH_USER_HOME/.ssh/authorized_keys""
sudo -u "$SSH_USER" chmod 600 "$SSH_USER_HOME/.ssh/authorized_keys"

# Allow passwordless sudo
echo "$SSH_USER ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/$SSH_USER >/dev/null
sudo chmod 440 /etc/sudoers.d/$SSH_USER
`;
