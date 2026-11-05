import {HardwareController} from './hardware-controller.js';

export function mountHardwarePanel() {
  const open = document.querySelector('#hardware-open'), dialog = document.querySelector('#hardware-dialog');
  const message = dialog.querySelector('[role="status"]'), address = dialog.querySelector('#hardware-address');
  const confirmed = dialog.querySelector('#hardware-confirm');
  const label = () => { open.textContent = controller.mode === 'device' ? '装置已连接' : controller.mode === 'error' ? '装置待重连' : '连接装置'; };
  const controller = new HardwareController({notify: text => { message.textContent = text; label(); }});
  try { address.value = localStorage.getItem('botanical-device-ip') || '192.168.31.174'; } catch {}
  open.onclick = () => dialog.showModal();
  dialog.querySelector('#hardware-close').onclick = () => dialog.close();
  async function action(button, work) {
    button.disabled = true;
    try { await work(); } catch (error) { message.textContent = error.message; }
    finally { button.disabled = false; label(); }
  }
  dialog.querySelector('form').onsubmit = event => {
    event.preventDefault();
    const button = dialog.querySelector('#hardware-connect');
    action(button, async () => {
      message.textContent = '正在连接，请允许浏览器访问本地网络…';
      await controller.connect(address.value, confirmed.checked);
      confirmed.checked = false;
      try { localStorage.setItem('botanical-device-ip', address.value.trim()); } catch {}
    });
  };
  dialog.querySelectorAll('[data-test-channel]').forEach(button => {
    button.onclick = () => action(button, async () => {
      if (controller.mode !== 'device') throw new Error('请先连接装置，再测试单路喷雾');
      await controller.spray(button.dataset.testChannel);
    });
  });
  dialog.querySelector('#hardware-stop').onclick = event => action(event.currentTarget, () => controller.stop());
  dialog.querySelector('#hardware-demo').onclick = event => action(event.currentTarget, () => controller.demo());
  return controller;
}
