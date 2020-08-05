require 'rails_helper'

describe SyncVitallyUsersWorker do
  let(:subject) { described_class.new }
  let(:school) { create(:school) }
  let(:user) { create(:teacher, school: school) }

  describe '#perform' do
    it 'build payloads from user objects and batch send them to Vitally' do
      vitally_api_double = double
      serializer_double = double('serializer', data: SerializeVitallySalesUser.new(user).data)
      expect(SerializeVitallySalesUser).to receive(:new).and_return(serializer_double)
      expect(VitallyApi).to receive(:new).and_return(vitally_api_double)
      expect(vitally_api_double).to receive(:batch).with([serializer_double.data])
      subject.perform([user.id])
    end
  end
end