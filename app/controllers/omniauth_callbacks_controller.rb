class OmniauthCallbacksController < Devise::OmniauthCallbacksController
  # Signs in the user, or redirects to the sign up page as required.
  # This method should work for most providers. All you should have to do, is
  # create aliases named to match the providers you wish to support.
  def all
    omniauth = request.env['omniauth.auth']
    @user = User.from_omniauth(omniauth)

    if @user.persisted?
      sign_in_and_redirect @user

      if is_navigational_format?
        set_flash_message(:notice, :success, kind: omniauth.provider.titleize)
      end
    else
      # This data is used to pre-populate user fields in the registration form
      session['devise.omniauth'] = omniauth

      redirect_to new_user_registration_url
    end
  end
  alias_method :facebook, :all
  alias_method :google_oauth2, :all
end
