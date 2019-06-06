module SegmentioHelper
  DEFAULT_DESTINATION_SETTINGS = {all: true}

  def generate_segment_identify_arguments(user, should_load_intercom)
    "#{user.id}, #{serialize_user(user).to_json}, #{destination_properties(user, should_load_intercom).to_json}"
  end

  def serialize_user(user)
    SegmentAnalyticsUserSerializer.new(user).render
  end

  def destination_properties(user, should_load_intercom)
    DEFAULT_DESTINATION_SETTINGS.merge(should_load_intercom ? {Intercom: intercom_properties(user)} : {})
  end

  def intercom_properties(user)
    {
      user_hash: OpenSSL::HMAC.hexdigest('sha256', ENV['INTERCOM_APP_SECRET'], user.id.to_s),
      name: user.name,
      email: user.email,
    }
  end

  def format_analytics_properties(request, properties)
    common_properties = { path: request.fullpath,
                          referrer: request.referrer, }
    custom_properties = properties.map{ |k,v| ["custom_" + k.to_s, v] }.to_h
    custom_properties.merge(common_properties)
  end
end
