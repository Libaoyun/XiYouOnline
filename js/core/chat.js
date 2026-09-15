/**
 * 汉风西游 - 冒泡社区聊天室模拟器
 * 还原当年斯凯冒泡社区极其热闹的【世界】、【门派】、【系统传闻】与【队伍】公屏氛围
 */
class ChatEngine {
  constructor() {
    this.messages = [];
    this.listeners = [];
    this.activeChannel = 'all'; // 'all' | 'world' | 'sect' | 'rumor'

    this.sampleWorldChats = [
      { name: '冷月无痕', sect: '金刚', text: '长安捉鬼 3 缺 2，来暴力输出或仙人控场，车头备足飞行符老司机开拔！++' },
      { name: '紫霞仙子', sect: '仙人', text: '高价收一本【魔兽要诀：高级神佑复生】，有的老板长安天台交易，童叟无欺！' },
      { name: '九天狂徒', sect: '妖魔', text: '出个极品洗好的4技能变异黑熊精，力资质1750满成长，带价密，记者勿扰！' },
      { name: '梦回冒泡', sect: '金刚', text: '以前冒泡社区的老朋友还有在的吗？当年拿山寨机在被窝里通宵打国家战，泪目了……' },
      { name: '风清扬', sect: '仙人', text: '李铁匠今天手气真黑，垫子垫了三把，青龙刀还是掉到+6了，心在滴血！' },
      { name: '小龙女', sect: '妖魔', text: '江南野外好多蛇，有没有哥哥带小妹刷几圈升级呀，包金创药~' },
      { name: '西楚霸王', sect: '金刚', text: '花果山美猴王试炼有人过了吗？大圣的横扫千军伤害也太爆炸了吧！' },
      { name: '剑胆琴心', sect: '仙人', text: '求教各位大佬，仙人前期到底是先加敏捷还是多加点耐力站桩？' }
    ];

    this.sampleRumors = [
      '【系统传闻】江湖豪侠【夜雨潇潇】在东海湾使用金柳露洗练，竟然引发天地异变，洗出了罕见的【变异大海龟】！',
      '【系统传闻】神兵出世！玩家【傲视三界】在长安铁匠铺，成功将【龙泉古剑】淬火强化至 +9！剑气冲霄！',
      '【系统传闻】降妖除魔！队伍【齐天小队】在江南野外成功缉拿【千年树妖首领】，缴获了无上灵物！',
      '【系统传闻】天降祥瑞！长安城天降祥云瑞气，三界豪侠士气大振，诸事顺遂！'
    ];

    this.initDefaultMessages();
    this.startAutoBroadcast();
  }

  initDefaultMessages() {
    this.addMessage('system', '系统', '欢迎来到《汉风西游》冒泡怀旧复刻版！梦回当年功能机与MRP时代的纯真江湖！', 'welcome');
    this.addMessage('rumor', '系统传闻', '三界妖氛渐浓，长安城钟馗正在招募英豪共剿恶鬼，速去建功立业！', 'rumor');
    this.addMessage('world', '冷月无痕[金刚]', '长安捉鬼4等1，来个群秒妖魔或者金刚，满人直接发车！！', 'world');
  }

  addMessage(channel, sender, content, badge = '') {
    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      channel: channel,
      sender: sender,
      content: content,
      badge: badge || channel,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    this.messages.push(msg);
    if (this.messages.length > 80) this.messages.shift(); // 保留最近80条

    this.notify(msg);
    return msg;
  }

  // 玩家发言
  sendPlayerMessage(player, text) {
    if (!text || !text.trim()) return false;
    const sectName = window.GAME_DATA.CLASSES[player.classId]?.name || '散人';
    this.addMessage('world', `${player.name}[${sectName}]`, text.trim(), 'world');
    return true;
  }

  // 发送系统传闻
  broadcastRumor(text) {
    this.addMessage('rumor', '传闻', text, 'rumor');
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify(msg) {
    this.listeners.forEach(fn => fn(msg, this.messages));
  }

  // 自动模拟当年公屏的热闹滚动
  startAutoBroadcast() {
    setInterval(() => {
      if (Math.random() < 0.6) {
        // 随机世界发言
        const item = this.sampleWorldChats[Math.floor(Math.random() * this.sampleWorldChats.length)];
        this.addMessage('world', `${item.name}[${item.sect}]`, item.text, 'world');
      } else {
        // 随机传闻
        const rumor = this.sampleRumors[Math.floor(Math.random() * this.sampleRumors.length)];
        this.addMessage('rumor', '传闻', rumor, 'rumor');
      }
    }, 12000 + Math.random() * 8000); // 每12~20秒一条
  }
}

window.ChatEngine = ChatEngine;
window.Chat = new ChatEngine();
