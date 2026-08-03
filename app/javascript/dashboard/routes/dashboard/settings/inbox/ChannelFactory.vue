<script>
import { defineComponent, h } from 'vue';
import Facebook from './channels/Facebook.vue';
import Website from './channels/Website.vue';
import Twitter from './channels/Twitter.vue';
import Api from './channels/Api.vue';
import Email from './channels/Email.vue';
import Sms from './channels/Sms.vue';
import Evolution from './channels/Evolution.vue';
import CloudWhatsapp from './channels/CloudWhatsapp.vue';
import Whatsapp from './channels/Whatsapp.vue';

const channelViewList = {
  whatsapp_qrcode: Evolution,
  whatsapp_official: CloudWhatsapp,
  whatsapp: Whatsapp,
};

export default defineComponent({
  name: 'NewChannelView',
  props: {
    channelName: {
      type: String,
      required: true,
    },
  },
  render() {
    const ChannelComponent = channelViewList[this.channelName];
    return ChannelComponent ? h(ChannelComponent) : null;
  },
});
</script>
