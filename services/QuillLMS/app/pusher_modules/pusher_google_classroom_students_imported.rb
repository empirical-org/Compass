module PusherGoogleClassroomStudentsImported

  def self.run(user_id)
    pusher_client = Pusher::Client.new(
        app_id: ENV["PUSHER_APP_ID"],
        key: ENV["PUSHER_KEY"],
        secret: ENV["PUSHER_SECRET"],
        encrypted: true
    )

    pusher_client.trigger(
      user_id.to_s,
     'google-classroom-students-imported',
     message: "Google classroom students imported for #{user_id}."
   )
  end

end
