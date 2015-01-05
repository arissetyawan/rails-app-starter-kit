# == Schema Information
#
# Table name: posts
#
#  id         :integer          not null, primary key
#  message    :string
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  tenant_id  :integer          not null
#

# A twitter-like post.
class Post < ActiveRecord::Base
  acts_as_tenant :tenant

  validates :message, presence: true, length: { minimum: 10, maximum: 140 }
  validates :user_id, presence: true

  belongs_to :user
end
