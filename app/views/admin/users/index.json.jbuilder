json.draw @users_adapter.draw
json.recordsTotal @users_adapter.records_total
json.recordsFiltered @users_adapter.records_filtered

json.data do
  json.array! @users_adapter.data do |user|
    json.(user, :id, :email, :created_at)
  end
end