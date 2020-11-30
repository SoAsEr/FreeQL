#include <boost/container/flat_set.hpp>

namespace SM_boost_utils{
    template<typename T>
    class flat_set : public boost::container::flat_set<T>{
        using parent=boost::container::flat_set<T>;
        public:
            const T& operator[](std::size_t index) const {
                return *(parent::cbegin()+index);
            }
            T& operator[](std::size_t index) {
                return *(parent::begin()+index);
            }
    };
}