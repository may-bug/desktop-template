import { invoke } from '@tauri-apps/api/core';

const changeTheme =async (theme:'dark'|'light') => {
    if (theme === 'dark') await invoke('set_status_bar_color', { color: '#000000' });
    else await invoke('set_status_bar_color', { color: '#FFFFFF' });
}

export {changeTheme}
