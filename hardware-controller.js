export function channelMask(key) {
  if (!/^(?=.+)A?B?C?D?$/.test(key)) throw new Error('气味通道无效');
  return [...key].reduce((mask, c) => mask | (1 << ('ABCD'.indexOf(c))), 0);
}

export function deviceAddress(value) {
  const parts = String(value).trim().split('.');
  if (parts.length !== 4 || parts.some(p => !/^\d{1,3}$/.test(p) || Number(p) > 255))
    throw new Error('请只填写串口监视器显示的 IPv4 地址，例如 192.168.31.174');
  const [a,b] = parts.map(Number);
  if (!(a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)))
    throw new Error('请填写装置的局域网地址');
  return parts.map(Number).join('.');
}

export class HardwareController {
  constructor({fetcher = globalThis.fetch.bind(globalThis), now = Date.now, notify = () => {}} = {}) {
    this.fetcher = fetcher; this.now = now; this.notify = notify;
    this.mode = 'demo'; this.base = ''; this.readyAt = 0; this.pending = null;
  }
  async request(path, data) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await this.fetcher(this.base + path, {
        method: data ? 'POST' : 'GET', mode: 'cors', credentials: 'omit',
        redirect: 'error', cache: 'no-store', targetAddressSpace: 'local', signal: controller.signal,
        ...(data ? {body: new URLSearchParams(data)} : {})
      });
      if (!response.ok) {
        const error = new Error(response.status === 409 ? '装置正在喷雾或停止中，请稍后再试' :
          response.status === 412 ? '装置重启了，请确认红色模块停止后重新连接' :
          response.status === 403 ? '网站地址未获装置允许，请检查程序中的 websiteOrigin' : '装置返回错误，请重新连接');
        error.httpStatus = response.status; throw error;
      }
      return await response.json();
    } catch (error) {
      if (error.httpStatus) throw error;
      throw new Error('未收到装置回复：检查同一 Wi-Fi、IP 和浏览器的本地网络权限。请勿连续重试；确认出雾状态后重新连接。');
    } finally { clearTimeout(timer); }
  }
  verify(status) {
    if (status?.protocol !== 'botanical-mist-v1' || JSON.stringify(status.pins) !== '[4,5,6,7]' ||
        typeof status.armed !== 'boolean' || typeof status.busy !== 'boolean')
      throw new Error('请先上传配套的四路 Arduino 程序（红4、蓝5、新红6、新红7）');
    return status;
  }
  async connect(address, confirmed) {
    if (this.pending || this.now() < this.readyAt) throw new Error('请等当前指令和喷雾结束后再连接');
    if (!confirmed) throw new Error('请先确认三个红色雾化器都没有喷雾');
    const base = 'http://' + deviceAddress(address);
    // Keep a failed connection out of demo mode: never silently fake a successful spray.
    this.mode = 'error'; this.base = base;
    const operation = (async () => {
      const status = this.verify(await this.request('/status'));
      if (status.busy) throw new Error('装置正在喷雾或停止中，请等待后再连接');
      const response = await this.request('/arm', {confirmed: '1'});
      if (response.armed !== true) throw new Error('装置未准备好，请重新连接');
      this.mode = 'device'; this.readyAt = 0;
      this.notify('装置已连接 · A红4 / B蓝5 / C红6 / D红7');
    })();
    this.pending = operation;
    try { await operation; } finally { if (this.pending === operation) this.pending = null; }
  }
  async spray(key) {
    channelMask(key);
    if (this.mode === 'demo') return;
    if (this.mode !== 'device') throw new Error('装置连接未就绪，请重新连接，或在面板中切换为网页演示');
    if (this.pending || this.now() < this.readyAt) throw new Error('请等本次喷雾结束后再挤压气囊');
    const operation = (async () => {
      try {
        const status = this.verify(await this.request('/status'));
        if (!status.armed) throw new Error('装置已重启，请确认红色模块停止后重新连接');
        if (status.busy) { const e = new Error('装置正在喷雾，请稍后再试'); e.httpStatus = 409; throw e; }
        const requestId = globalThis.crypto.randomUUID();
        const result = await this.request('/spray', {channels: key, requestId});
        if (result.status !== 'spraying' || result.channels !== key || result.duration !== 5000)
          throw new Error('装置回复异常，请检查实际出雾状态后重新连接');
        this.readyAt = this.now() + 5500;
        this.notify('已发送 ' + key + ' 通道 · 程序将在约5秒后关闭');
      } catch (error) {
        if (error.httpStatus !== 409) this.mode = 'error';
        throw error;
      }
    })();
    this.pending = operation;
    try { await operation; } finally { if (this.pending === operation) this.pending = null; }
  }
  async stop() {
    // Serialize after a pending start so an earlier stop cannot be overtaken by it.
    const previous = this.pending;
    const operation = (async () => {
      if (previous) await previous.catch(() => {});
      if (!this.base) return;
      try {
        const result = await this.request('/stop', {requested: '1'});
        if (result.status !== 'stopping') throw new Error('停止回复异常，请检查装置');
        this.readyAt = this.now() + 600;
        this.notify('停止指令已发送，请观察雾化器是否停止');
      } catch (error) { this.mode = 'error'; throw error; }
    })();
    this.pending = operation;
    try { await operation; } finally { if (this.pending === operation) this.pending = null; }
  }
  async demo() {
    if (this.base) await this.stop();
    this.mode = 'demo'; this.base = ''; this.notify('网页演示 · 不发送喷雾指令');
  }
}
