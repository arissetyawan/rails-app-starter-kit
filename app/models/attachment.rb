# == Schema Information
#
# Table name: attachments
#
#  id         :integer          not null, primary key
#  name       :string
#  url        :string(1024)
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Attachment < ActiveRecord::Base
  validates :url, presence: true
  validates :user_id, presence: true

  before_save :populate_missing_fields
  after_destroy :delete_from_provider

  belongs_to :user
  has_many :attachment_joins, dependent: :destroy
  has_many :attachments, through: :attachment_joins

  private

  def populate_missing_fields
    self[:name] ||= File.basename(url, '.*')
  end

  # Called after destruction.
  # In turns, this calls Attachment.delete_from_store.
  def delete_from_provider
    Attachment.delete_from_store(url)
  end

  # Initiates a request to delete an attachment from the backing store.
  #
  # Extracted out into a class method, so that it can be used to delete
  # just-uploaded files whose corresponding Attachment model was not created
  # successfully.
  #
  # @param url [String] the attachment URL
  def self.delete_from_store (url)
    # Add more stores as and when supported
    if url.start_with? AwsUtils::S3_URL
      AwsUtils.s3_delete(url)
    end
  end
end
