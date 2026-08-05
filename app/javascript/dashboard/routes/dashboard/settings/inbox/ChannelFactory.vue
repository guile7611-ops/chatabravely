<script>
import { defineComponent, h } from 'vue';
import Evolution from './channels/Evolution.vue';
import CloudWhatsapp from './channels/CloudWhatsapp.vue';

const channelViewList = {
  whatsapp_qrcode: Evolution,
  whatsapp_official: CloudWhatsapp,
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
